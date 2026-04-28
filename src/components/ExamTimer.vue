<template>
  <div class="exam-timer" :class="statusClass">
    <div class="timer-display">
      <el-icon :size="20"><Timer /></el-icon>
      <span>{{ time }}</span>
    </div>

    <div v-if="status === 'finished'" class="timer-message">
      考试已结束
    </div>

    <div v-else-if="status === 'paused'" class="timer-message">
      考试已暂停
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  components: {
    Timer
  },
  props: {
    time: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'ongoing' // ongoing, paused, finished
    }
  },
  setup(props) {
    const statusClass = computed(() => {
      return {
        'ongoing': 'timer-ongoing',
        'paused': 'timer-paused',
        'finished': 'timer-finished'
      }[props.status];
    });

    return {
      statusClass
    };
  }
};
</script>

<style scoped>
.exam-timer {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timer-ongoing {
  background-color: #f0f9eb;
  color: #67c23a;
}

.timer-paused {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.timer-finished {
  background-color: #fef0f0;
  color: #f56c6c;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.timer-message {
  font-weight: bold;
}
</style>