export default interface Block {
  map: number[][],
  rotation: 0,
  // number type of block
  type: number,
  x: number,
  // the block map for the long block and the square, starting with an empty zero row
  y: number,
}
