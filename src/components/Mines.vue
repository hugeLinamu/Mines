<template>

  <div v-for="row, y in state" :key="y" class="box">
    <button 
    v-for="block, x in row" :key="x" 
    class="btn" 
    :style="{ color: getBlockClass(block) }"
    @click="onClick(block)"
    @contextmenu.prevent="onRightClick(block)"
    >
      <template v-if="block.isFlag" >
        <div class="iconfont" style="color:coral; text-align: center;">  &#xe6a8;  </div>
      </template>
      <template v-if="block.isReveal || dev">
        <div v-if="block.isMine" class="iconfont"> &#xe68a;</div>
        <div v-else> {{ block.adjacentMines }}</div>
      </template>
    </button>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'



interface BlockState {
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

const WIDTH: number = 10
const HEIGHT: number = 10

// 生成二维数组
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        isReveal: false,
        isFlag: false,
        isMine: false,
        adjacentMines: 0
      })
    ),
  ),
)

const numberColors = [
  'green',
  '#00bc12',
  '#ff8936',
  '#493131',
  'skyblue',
  'pink',
  '#41555d',
  '#789262'
]

function onRightClick(block:BlockState){
  if(block.isReveal) return
  block.isFlag = !block.isFlag
}


// 上帝模式
const dev = false

// 是否产生炸弹
let mineGenerated = false

// 生成炸弹     
function generateMines(initial: BlockState) {
  // init 表示第一次点击时候的位置
  for (const row of state) {
    for (const block of row) {
      // 第一次点击, 上下左右都为 0 , 即不是炸弹
      // 有bug , x轴和y轴都为0 
      if (Math.abs(block.x - initial.x) <= 1) continue
      if (Math.abs(block.y - initial.y) <= 1) continue
      block.isMine = Math.random() < 0.3
    }
  }
}

// 八个方向
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
]


// 生成附近有炸弹的数
// function updateNumbers() {
//   for (const row of state) {
//     for (const block of row) {
//       // 进来判断是不是炸弹 , 是炸弹直接返回
//       if (block.isMine) {

//         continue
//       }
//       directions.forEach(([dx, dy]) => {
//         const x2 = block.x + dx
//         const y2 = block.y + dy
//         // 边界限定
//         if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) 
//           return

//         // console.log(state[dy][dx].isMine);
//         if(state[y2][x2].isMine){
//           block.adjacentMines += 1
//         }

//       })
//     }
//   }
// }

// // 生成附近有炸弹的数
function updateNumbers() {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      // 进来判断是不是炸弹 , 是炸弹直接返回
      if (block.isMine)
        return
      directions.forEach(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        // 边界限定
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
          return
        if (state[y2][x2].isMine) {
          block.adjacentMines += 1
        }
      })
      // getSibling(block)
      //   .forEach((b) => {
      //     if (b?.isMine) {
      //       block.adjacentMines += 1
      //     }
      //   })
    })
  })
}

function getSibling(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = dx + block.x
    const y2 = dy + block.y
    // 越界
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    // 返回一个数组
    return state[x2][y2]
  })
    // 对数组进行一个过滤
    .filter(Boolean) as BlockState[]
}


// 字体颜色
function getBlockClass(block: BlockState) {
  if (!block.isReveal) return ''
  return block.isMine ? 'red' : numberColors[block.adjacentMines] 
}

// 点击后在显示
function onClick(block: BlockState) {
  // 如果没有生成炸弹  
  if (!mineGenerated) {
    generateMines(block)
    updateNumbers()
    mineGenerated = true
  }
  block.isReveal = true
  expendZero(block)
} 

function expendZero(block: BlockState) {
  if (block.adjacentMines !== 0)
    return
  getSibling(block).forEach((s) => {
    // 不是 0 
    if (!s.isReveal && s.adjacentMines == 0 && !s.isMine) {
      s.isReveal = true
      expendZero(s)
    }
  })
}


</script>

<style scoped>


@font-face {
  font-family: 'iconfont';
  src: url('../assets/icon/iconfont.ttf?t=1672822715486') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn {
  margin: 1px;
  width: 50px;
  height: 50px;
}
</style>
