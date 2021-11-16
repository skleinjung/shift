import { findIndex, minBy } from 'lodash/fp'

export interface XY {
  x: number
  y: number
}

export interface PathfindingInput {
  goal: XY
  start: XY
}

export interface AStarOptions extends PathfindingInput {
  /** given an x,y coordinate, return a list of coordinates that are considered neighbors */
  getNeighbors: (position: XY) => XY[]

  /**
   * Distance function to calculate the weight of the edge between two locations. By default, this
   * will be a constant value meaning all paths are weighted equally.
   **/
  distance?: (position1: XY, position2: XY) => number

  /** A* heuristic function, estimates the cost to reach goal from a given node */
  heuristic: (position: XY, goal: XY) => number

  /**
   * Number of nodes to search before giving up and determining the path cannot be reached. Might fail
   * searches for really long paths, but avoids freezing or extreme delays if the destination is unreachable.
   */
  failAfter?: number
}

export type PathfindingResult = XY[]

/** converts an x,y coordinate to a map key */
const nodeKey = ({ x, y }: XY) => `${x},${y}`

class PathNode implements XY {
  public key: string
  public previous: PathNode | undefined

  constructor (
    public x: number,
    public y: number
  ) {
    this.key = nodeKey(this)
  }
}

const buildPath = (previousNeighbors: { [k: string]: XY }, goal: XY) => {
  const path = []
  let current = goal

  do {
    path.unshift(current)
    const currentKey = nodeKey(current)
    current = previousNeighbors[currentKey]
  } while (current !== undefined)

  return path
}

export const aStar = ({
  distance = () => 1,
  getNeighbors,
  goal,
  heuristic,
  start,
  failAfter = Number.MAX_SAFE_INTEGER,
}: AStarOptions): PathfindingResult => {
  let attemptsRemaining = failAfter

  const startNode = new PathNode(start.x, start.y)
  const openSet: PathNode[] = [startNode]

  const fScores: { [k: string]: number } = {}
  const gScores: { [k: string]: number } = {}
  const previousNeighbors: { [k: string]: XY } = {}

  gScores[startNode.key] = 0
  fScores[startNode.key] = heuristic(startNode, goal)

  const removeFromOpenSet = (node: PathNode) => {
    const index = findIndex((candidate) => candidate.key === node.key, openSet)
    if (index > -1) {
      openSet.splice(index, 1)
    }
  }

  while (openSet.length > 0 && attemptsRemaining-- > 0) {
    const current = minBy((node) => {
      return fScores[node.key] ?? Number.MAX_SAFE_INTEGER
    }, openSet) ?? openSet[openSet.length - 1]

    const currentKey = nodeKey(current)

    if (current.x === goal.x && current.y === goal.y) {
      return buildPath(previousNeighbors, goal)
    }

    removeFromOpenSet(current)

    const neighbors = getNeighbors(current)
    for (const neighbor of neighbors) {
      const neighborKey = nodeKey(neighbor)

      const tempG = (gScores[currentKey] ?? Number.MAX_SAFE_INTEGER) + distance(current, neighbor)

      if (tempG < (gScores[neighborKey] ?? Number.MAX_SAFE_INTEGER)) {
        // we found a better path than previous
        previousNeighbors[neighborKey] = current
        gScores[neighborKey] = tempG
        fScores[neighborKey] = tempG + heuristic(neighbor, goal)

        if (findIndex((node) => node.key === neighborKey, openSet) === -1) {
          openSet.unshift(new PathNode(neighbor.x, neighbor.y))
        }
      }
    }
  }

  return []
}
