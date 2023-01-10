<template>
    <button class="btn" :style="{ color: getBlockClass(block) }">
        <template v-if="block.isFlag">
            <div class="iconfont" style="color:coral; text-align: center;"> &#xe6a8; </div>
        </template>
        <template v-if="block.isReveal || dev">
            <div v-if="block.isMine" class="iconfont"> &#xe68a;</div>
            <div v-else> {{ block.adjacentMines }}</div>
        </template>
    </button>
</template>

<script setup lang='ts'>
import { BlockState } from '../type'
import { defineProps  } from 'vue'

defineProps<{
    block:BlockState,
    dev:boolean
}>()


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

// 字体颜色
function getBlockClass(block: BlockState) {
  if (!block.isReveal) return ''
  return block.isMine ? 'red' : numberColors[block.adjacentMines]
}

</script>

<style scoped >
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
.btn {
  margin: 1px;
  width: 50px;
  height: 50px;
}
</style>