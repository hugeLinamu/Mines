<template>
  <div v-for="row, y in state" :key="y" class="box">
    <MineBlock v-for="block, x in row" :key="x" :block=block :dev=dev @click="onClick(block)"
      @contextmenu.prevent="onRightClick(block)"></MineBlock>
  </div>
  <div class="toFlex">
    <button @click="toDev">上帝模式:{{ isDev }}</button>
    <button @click="reset">重置</button>
  </div>


</template>
<script setup lang="ts">
import { reactive, watchEffect, ref } from 'vue'
import { BlockState } from '../type'
import MineBlock from './MineBlock.vue'

const WIDTH: number = 10
const HEIGHT: number = 10
let dev = ref(false)
let isDev = ref('否')
let gameState = ref<'play'|'won'|'lost'>('play')

// 是否产生炸弹
let mineGenerated = false
// 生成二维数组 , 这里不能用 reactive , 要用 ref , 因为后面 reset的时候, state的地址发生了改变, 监听不到
let state = ref<BlockState[][]>([])

function toDev() {
  dev.value = !dev.value
  dev.value ? isDev.value = '是' : isDev.value = '否'
}

function reset() {
  state.value = Array.from({ length: HEIGHT }, (_, y) =>
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
  )
  mineGenerated = false
  gameState.value = 'play'
}
reset()

function onRightClick(block: BlockState) {
  if (gameState.value != 'play') return
  if (block.isReveal) return
  block.isFlag = !block.isFlag
}



// 生成炸弹     
function generateMines(initial: BlockState) {
  // init 表示第一次点击时候的位置
  for (const row of state.value) {
    for (const block of row) {
      // 第一次点击, 上下左右都为 0 , 即不是炸弹
      // 有bug , x轴和y轴都为0 
      if (Math.abs(block.x - initial.x) <= 1) continue
      if (Math.abs(block.y - initial.y) <= 1) continue
      block.isMine = Math.random() < 0.3
    }
  }
  updateNumbers()
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

// // 生成附近有炸弹的数
function updateNumbers() {
  state.value.forEach((row, y) => {
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
        if (state.value[y2][x2].isMine) {
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
    return state.value[x2][y2]
  })
    // 对数组进行一个过滤
    .filter(Boolean) as BlockState[]
}


function expendZero(block: BlockState) {
  if (block.adjacentMines !== 0)
    return
  getSibling(block).forEach((s) => {
    // 不是 0 
    if (!s.isReveal && s.adjacentMines === 0 && !s.isMine) {
      s.isReveal = true
      expendZero(s)
    }
  })
}


// 点击后在显示
function onClick(block: BlockState) {
  if (gameState.value != 'play') return
  // 如果没有生成炸弹  
  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }
  block.isReveal = true
  if (block.isMine) {
    showAllMines()
    gameState.value = 'lost'
    alert('Boom')

    return
  }
  expendZero(block)
}

function checkGameState() {
  const blocks = state.value.flat()
  if (blocks.every(block => block.isReveal || block.isFlag)) {
    if (blocks.some(block => block.isFlag && !block.isMine)) {
      showAllMines()
      gameState.value = 'lost'
      alert('你骗人')
  
      return
    }
    else {
      alert('你赢了')
      gameState.value = 'won'
      return
    }
  }
}

watchEffect(checkGameState)

function showAllMines(){
  const blocks = state.value.flat()
  blocks.forEach((block)=>{
    if(block.isMine) {
      block.isReveal = true
    }
  })
}

</script>

<style scoped>
.box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toFlex {
  display: flex;
  margin-top: 10px;
  justify-content: space-around;
  align-items: center;
}
</style>
