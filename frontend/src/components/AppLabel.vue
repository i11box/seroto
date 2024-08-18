<template>
  <div>
    <button class="label">
      <h2>
        <slot></slot>
      </h2>
    </button>
  </div>
</template>

<script setup>
</script>

<style scoped>
.label {
  background-color: #22212C; /* 背景颜色 */
  color: #A7ADB4; /* 文本颜色 */
  border: none; /* 去掉默认边框 */
  padding: 10px 20px; /* 内边距 */
  text-align: center; /* 左对齐文本 */
  width: 100%; /* 按钮宽度100% */
  transition: background-color 0.3s, color 0.3s; /* 添加过渡效果 */
}

.label:hover {
  background-color: #C570C9; /* 悬停时改变背景色 */
  color: #ffffff; /* 悬停时文本变白 */
}

.label h2 {
  margin: 0; /* 移除标题的默认外边距 */
  font-size: 19px; /* 调整字体大小 */
  font-weight: normal; /* 设置字体权重 */
}
</style>
