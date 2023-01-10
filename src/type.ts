export interface BlockState {
    x: number,
    y: number,
    // 是否翻开
    isReveal: boolean,
    // 是否标记
    isFlag: boolean,
    // 是不是炸弹
    isMine: boolean,
    // 相邻的炸弹数量  
    adjacentMines: number
  }
  