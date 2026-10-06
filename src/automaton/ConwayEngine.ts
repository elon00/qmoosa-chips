/**
 * ConwayEngine.ts
 * Cellular Automaton Engine for Semiconductor Wafer Defect Simulation
 * and Web 4.0 Autonomous Agent Topology Evolution
 */

import { WaferYieldModel, WaferMetrics } from './WaferYieldModel';

export type AutomatonRule = 'B3/S23' | 'B36/S23' | 'B3/S123';

export class ConwayEngine {
  public rows: number;
  public cols: number;
  public grid: number[][];
  public generation: number;
  public rule: AutomatonRule;
  public circularMask: boolean;

  constructor(rows = 36, cols = 36, rule: AutomatonRule = 'B3/S23', circularMask = true) {
    this.rows = rows;
    this.cols = cols;
    this.rule = rule;
    this.circularMask = circularMask;
    this.generation = 0;
    this.grid = this.createEmptyGrid();
    this.loadPreset('edgeCluster');
  }

  public createEmptyGrid(): number[][] {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }

  public isWithinWaferCircle(r: number, c: number): boolean {
    if (!this.circularMask) return true;
    const centerR = this.rows / 2;
    const centerC = this.cols / 2;
    const dist = Math.sqrt(Math.pow(r - centerR, 2) + Math.pow(c - centerC, 2));
    const maxRadius = Math.min(centerR, centerC) * 0.95;
    return dist <= maxRadius;
  }

  public toggleCell(r: number, c: number): void {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = this.grid[r][c] === 1 ? 0 : 1;
    }
  }

  public setCell(r: number, c: number, val: number): void {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = val;
    }
  }

  public randomize(defectProbability = 0.08): void {
    this.grid = Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.cols }, (_, c) => {
        if (!this.isWithinWaferCircle(r, c)) return 0;
        return Math.random() < defectProbability ? 1 : 0;
      })
    );
    this.generation = 0;
  }

  public clear(): void {
    this.grid = this.createEmptyGrid();
    this.generation = 0;
  }

  public step(): void {
    const next = this.createEmptyGrid();

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.circularMask && !this.isWithinWaferCircle(r, c)) {
          next[r][c] = 0;
          continue;
        }

        const neighbors = this.countNeighbors(r, c);
        const alive = this.grid[r][c] === 1;

        if (this.rule === 'B3/S23') {
          // Standard Conway
          if (alive && (neighbors === 2 || neighbors === 3)) {
            next[r][c] = 1;
          } else if (!alive && neighbors === 3) {
            next[r][c] = 1;
          } else {
            next[r][c] = 0;
          }
        } else if (this.rule === 'B36/S23') {
          // HighLife
          if (alive && (neighbors === 2 || neighbors === 3)) {
            next[r][c] = 1;
          } else if (!alive && (neighbors === 3 || neighbors === 6)) {
            next[r][c] = 1;
          } else {
            next[r][c] = 0;
          }
        } else if (this.rule === 'B3/S123') {
          // Litho-Etch defect drift
          if (alive && neighbors >= 1 && neighbors <= 3) {
            next[r][c] = 1;
          } else if (!alive && neighbors === 3) {
            next[r][c] = 1;
          } else {
            next[r][c] = 0;
          }
        }
      }
    }

    this.grid = next;
    this.generation++;
  }

  private countNeighbors(r: number, c: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + this.rows) % this.rows;
        const nc = (c + dc + this.cols) % this.cols;
        if (this.grid[nr][nc] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  public getMetrics(): WaferMetrics {
    return WaferYieldModel.calculateMetrics(this.grid);
  }

  public computeStateProofHash(): string {
    let hash = 0x811c9dc5;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.grid[r][c];
        hash ^= val + (r * 31) + (c * 17);
        hash = (hash * 0x01000193) >>> 0;
      }
    }
    return '0x' + hash.toString(16).padStart(8, '0') + `_gen${this.generation}`;
  }

  public loadPreset(name: 'cleanWafer' | 'edgeCluster' | 'ssmbPulse' | 'pulsar' | 'gliderSteppers'): void {
    this.clear();
    const midR = Math.floor(this.rows / 2);
    const midC = Math.floor(this.cols / 2);

    if (name === 'cleanWafer') {
      // 100% pristine wafer
      return;
    }

    if (name === 'edgeCluster') {
      // Edge contamination ring typical in spin-coating
      const centerR = this.rows / 2;
      const centerC = this.cols / 2;
      const targetRadius = Math.min(centerR, centerC) * 0.78;

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const dist = Math.sqrt(Math.pow(r - centerR, 2) + Math.pow(c - centerC, 2));
          if (Math.abs(dist - targetRadius) < 2.5 && Math.random() < 0.45) {
            this.setCell(r, c, 1);
          }
        }
      }
    } else if (name === 'ssmbPulse') {
      // Particle accelerator SSMB pulse wavefront
      for (let c = midC - 10; c <= midC + 10; c++) {
        if (c >= 0 && c < this.cols) {
          this.setCell(midR, c, 1);
          if (c % 2 === 0) {
            this.setCell(midR - 1, c, 1);
            this.setCell(midR + 1, c, 1);
          }
        }
      }
    } else if (name === 'gliderSteppers') {
      // Gliders simulating lithography scan heads
      const gliders = [
        [midR - 8, midC - 8],
        [midR + 5, midC - 6],
        [midR - 4, midC + 7],
      ];
      for (const [gr, gc] of gliders) {
        this.setCell(gr, gc + 1, 1);
        this.setCell(gr + 1, gc + 2, 1);
        this.setCell(gr + 2, gc, 1);
        this.setCell(gr + 2, gc + 1, 1);
        this.setCell(gr + 2, gc + 2, 1);
      }
    } else if (name === 'pulsar') {
      // Pulsar oscillator at center
      const p = [
        [-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4],
        [-4, -6], [-3, -6], [-2, -6], [2, -6], [3, -6], [4, -6],
        [-4, -1], [-3, -1], [-2, -1], [2, -1], [3, -1], [4, -1],
        [-4, 1], [-3, 1], [-2, 1], [2, 1], [3, 1], [4, 1],
        [-4, 6], [-3, 6], [-2, 6], [2, 6], [3, 6], [4, 6],
        [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
        [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4],
        [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4],
      ];
      for (const [dr, dc] of p) {
        this.setCell(midR + dr, midC + dc, 1);
      }
    }
  }
}
