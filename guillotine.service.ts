// src/app/guillotine.service.ts
import { Injectable } from '@angular/core';

interface Rectangle {
  width: number;
  height: number;
  label: string;
  rotated?: boolean;
  grainDirection?: 'horizontal' | 'vertical';
}

interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  grainDirection?: 'horizontal' | 'vertical';
  used: boolean;
  down?: Node;
  right?: Node;
  rotated?: boolean; // Add the 'rotated' property
}

@Injectable({
  providedIn: 'root'
})
export class GuillotineService {
  bladeThickness: number = 0;
  constructor() { }

  fit(rectangles: Rectangle[], binWidth: number, binHeight: number): Node[] {
    if (binWidth <= 0 || binHeight <= 0) {
      throw new Error('Bin dimensions must be greater than zero.');
    }

    rectangles.forEach(rect => {
      if (rect.width <= 0 || rect.height <= 0) {
        throw new Error('Rectangle dimensions must be greater than zero.');
      }
    });

    // Sort rectangles by area in descending order
    rectangles.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    const root: Node = { x: 0, y: 0, width: binWidth, height: binHeight, used: false, label: '' };
    const nodes: Node[] = [];

    rectangles.forEach(rect => {
      const node = this.findBestNode(root, rect);
      if (node) {
        this.splitNode(node, rect);
        nodes.push({ ...node, width: rect.width, height: rect.height, label: rect.label, rotated: rect.rotated, grainDirection: rect.grainDirection });
      } else {
        throw new Error(`Rectangle ${rect.width}x${rect.height} does not fit in the bin.`);
      }
    });

    return nodes;
  }
  private findBestNode(root: Node, rect: Rectangle): Node | null {
    let bestNode: Node | null = null;
    let bestFit = Infinity;

    const findNode = (node: Node): void => {
      if (node.used) {
        if (node.right) findNode(node.right);
        if (node.down) findNode(node.down);
      } else {
        const fits = (width: number, height: number) => width <= node.width && height <= node.height;
        const fit = (width: number, height: number) => (node.width - width) * (node.height - height);

        if (fits(rect.width, rect.height)) {
          const currentFit = fit(rect.width, rect.height);
          if (currentFit < bestFit) {
            bestFit = currentFit;
            bestNode = node;
            rect.rotated = false;
          }
        }

        if (fits(rect.height, rect.width)) {
          const currentFit = fit(rect.height, rect.width);
          if (currentFit < bestFit) {
            bestFit = currentFit;
            bestNode = node;
            rect.rotated = true;
          }
        }
      }
    };
    findNode(root);
    return bestNode;
  }
  private splitNode(node: Node, rect: Rectangle): void {
    node.used = true;
    const bladeThickness = this.bladeThickness;

    if (rect.rotated) {
      node.down = { x: node.x, y: node.y + rect.width + bladeThickness, width: node.width, height: node.height - rect.width - bladeThickness, used: false, label: '' };
      node.right = { x: node.x + rect.height + bladeThickness, y: node.y, width: node.width - rect.height - bladeThickness, height: rect.width, used: false, label: '' };
    } else {
      node.down = { x: node.x, y: node.y + rect.height + bladeThickness, width: node.width, height: node.height - rect.height - bladeThickness, used: false, label: '' };
      node.right = { x: node.x + rect.width + bladeThickness, y: node.y, width: node.width - rect.width - bladeThickness, height: rect.height, used: false, label: '' };
    }
  }
}