<template>
  <h2>MineSweeper</h2>

  <div class="toFlex"> 模式:
    <button class="button" @click="easy"> Easy </button>
    <button class="button" @click="medium"> Medium </button>
    <button class="button" @click="hard"> Hard </button>
  </div>

  <div class="toFlex" style="font-size:30px; padding: 15px">
    <div>⏲ {{ state.timer }}</div>
    <div class="iconfont">&#xe68a; {{ countMines }}</div>
  </div>
  <div v-for="row, y in state.board" :key="y" class="box">
    <MineBlock v-for="block, x in row" :key="x" :block=block :dev=state.dev @click="onClick(block)"
      @contextmenu.prevent="onRightClick(block)"></MineBlock>
  </div>
  <div class="toFlex">
    <button class="button" @click="state.dev = !state.dev">上帝模式:{{ state.dev ? '是' : '否' }}</button>
    <button class="button" @click="reset()">重置</button>
  </div>

</template>
<script setup lang="ts">
import { watchEffect, ref, Ref, computed } from 'vue'
import { BlockState } from '../type'
import MineBlock from './MineBlock.vue'
import { useStorage } from '@vueuse/core'

interface allGameState {
  timer: number,
  width: number,
  height: number,
  dev: boolean,
  gameState: 'play' | 'won' | 'lost',
  // 是否产生炸弹
  mineGenerated: boolean,
  board: BlockState[][]
  // 总共要生成炸弹的数量
  totalMines: number
}

// 生成二维数组 , 这里不能用 reactive , 要用 ref , 因为后面 reset的时候, state的地址发生了改变, 监听不到
let state = ref() as Ref<allGameState>
// let state = ref<allGameState>()

let time:number

// 重置
function reset(height = 10, width = 10, totalMines = 10) {
  state.value = {
    timer:0,
    width,
    height,
    dev: false,
    gameState: 'play',
    mineGenerated: false,
    totalMines: totalMines,
    board: Array.from({ length: height }, (_, y) =>
      Array.from({ length: width },
        (_, x): BlockState => ({
          x,
          y,
          isReveal: false,
          isFlag: false,
          isMine: false,
          adjacentMines: 0
        })
      )
    )
  }
  if(time){
    clearInterval(time)
  }
  time = setInterval(()=>{
  state.value.timer++
},1000)
}
reset()
// watchEffect(reset)




function onRightClick(block: BlockState) {
  if (state.value.gameState != 'play') return
  if (block.isReveal) return
  block.isFlag = !block.isFlag
}


function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}
// 生成炸弹
function randomInt(min: number, max: number) {
  return Math.round(random(min, max))
}

// 生成炸弹     
function generateMines(initial: BlockState) {
  function palceRandom() {
    // 生成炸弹的位置
    const x = randomInt(0, state.value.width - 1)
    const y = randomInt(0, state.value.height - 1)
    const block = state.value.board[x][y]
    if (block?.isMine)
      return false
    if (Math.abs(block.x - initial.x) <= 1)
      return false
    if (Math.abs(block.y - initial.y) <= 1)
      return false
    block.isMine = true
    return true
  }
  // 生成固定炸弹数量  先生成一个数组, 然后对数组进行一个遍历
  Array.from({ length: state.value.totalMines }, () => null)
    .forEach(() => {
      // 每个元素都返回一个 true为止
      while (!palceRandom()) { }
    })
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
  state.value.board.forEach((row, y) => {
    row.forEach((block, x) => {
      // 进来判断是不是炸弹 , 是炸弹直接返回
      if (block.isMine)
        return
      directions.forEach(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        // 边界限定
        if (x2 < 0 || x2 >= state.value.width || y2 < 0 || y2 >= state.value.height)
          return
        if (state.value.board[y2][x2].isMine) {
          block.adjacentMines += 1
        }
      })
    })
  })
}

function getSibling(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = dx + block.x
    const y2 = dy + block.y
    // 越界
    if (x2 < 0 || x2 >= state.value.width || y2 < 0 || y2 >= state.value.height)
      return undefined
    // 返回一个数组
    return state.value.board[x2][y2]
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

function onClick(block: BlockState) {
  if (state.value.gameState != 'play') return
  // 如果没有生成炸弹  
  if (!state.value.mineGenerated) {
    generateMines(block)
    state.value.mineGenerated = true
  }
  block.isReveal = true
  if (block.isMine) {
    showAllMines()
    state.value.gameState = 'lost'
    alert('Boom')
    clearInterval(time)
    return
  }
  expendZero(block)
}

function checkGameState() {
  const blocks = state.value.board?.flat()
  if (blocks?.every(block => block.isReveal || block.isFlag)) {
    if (blocks?.some(block => block.isFlag && !block.isMine)) {
      showAllMines()
      state.value.gameState = 'lost'
      alert('你骗人')
      clearInterval(time)
      return
    }
    else {
      alert('你赢了')
      state.value.gameState = 'won'
      clearInterval(time)
      return
    }
  }
}

watchEffect(checkGameState)

function showAllMines() {
  const blocks = state.value.board.flat()
  blocks.forEach((block) => {
    if (block.isMine) {
      block.isReveal = true
    }
  })
}

const countMines = computed(() => {
  return state.value.board.flat().reduce(
    (preValue, currentValue) => preValue + (currentValue.isMine ? 1 : 0) - (currentValue.isFlag ? 1 : 0)
    , 0)
})

function easy() {
  reset()
}
function medium() {
  reset(15, 15, 40)
}
function hard() {
  reset(20, 20, 99)
}

useStorage('mineSweeper', state)


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

.toFlex {
  display: flex;
  margin-top: 10px;
  justify-content: space-around;
  align-items: center;
}

.button {
  color: white;
  background-color: rgb(18, 180, 28);
}
</style>
