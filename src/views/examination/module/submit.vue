<template>
    <div class="exam-container">
      <!-- 考试信息栏 -->
      <div class="exam-header">
        <div class="exam-title">{{ examData.title }}</div>
        <div class="exam-info">
          <span>总题数: {{ examData.questions.length }}</span>
          <span>已答题: {{ answeredCount }}</span>
          <span>未答题: {{ unansweredCount }}</span>
        </div>
        <div class="timer">
          <el-tag type="danger" effect="dark">剩余时间: {{ formattedTime }}</el-tag>
        </div>
      </div>

      <!-- 题目导航 -->
      <div class="question-nav">
        <el-button
          v-for="(question, index) in examData.questions"
          :key="index"
          :type="getQuestionButtonType(index)"
          @click="goToQuestion(index)"
          circle
        >
          {{ index + 1 }}
        </el-button>
      </div>

      <!-- 题目内容区 -->
      <div class="question-content">
        <div class="question-header">
          <span>题目 {{ currentQuestionIndex + 1 }} / {{ examData.questions.length }}</span>
          <span>({{ examData.questions[currentQuestionIndex].type }})</span>
          <span>{{ examData.questions[currentQuestionIndex].score }}分</span>
        </div>

        <div class="question-body">
          <h3>{{ examData.questions[currentQuestionIndex].title }}</h3>
          <div v-if="examData.questions[currentQuestionIndex].type === '单选题'">
            <el-radio-group v-model="currentAnswers[currentQuestionIndex]">
              <el-radio
                v-for="(option, optIndex) in examData.questions[currentQuestionIndex].options"
                :key="optIndex"
                :label="option.value"
                @change="saveAnswer"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </div>
          <div v-else-if="examData.questions[currentQuestionIndex].type === '多选题'">
            <el-checkbox-group v-model="currentAnswers[currentQuestionIndex]">
              <el-checkbox
                v-for="(option, optIndex) in examData.questions[currentQuestionIndex].options"
                :key="optIndex"
                :label="option.value"
                @change="saveAnswer"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div v-else-if="examData.questions[currentQuestionIndex].type === '判断题'">
            <el-radio-group v-model="currentAnswers[currentQuestionIndex]">
              <el-radio label="true" @change="saveAnswer">正确</el-radio>
              <el-radio label="false" @change="saveAnswer">错误</el-radio>
            </el-radio-group>
          </div>
          <div v-else>
            <el-input
              type="textarea"
              :rows="4"
              v-model="currentAnswers[currentQuestionIndex]"
              placeholder="请输入答案"
              @blur="saveAnswer"
            ></el-input>
          </div>
        </div>

        <div class="question-footer">
          <el-button @click="prevQuestion" :disabled="currentQuestionIndex === 0">上一题</el-button>
          <el-button @click="nextQuestion" :disabled="currentQuestionIndex === examData.questions.length - 1">下一题</el-button>
          <el-button type="primary" @click="submitExam">提交试卷</el-button>
        </div>
      </div>
    </div>
  </template>

  <script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  export default {
    setup() {
      // 考试数据
      const examData = ref({
        title: 'Vue3 组合式 API 考试',
        duration: 120, // 分钟
        questions: [
          {
            id: 1,
            title: 'Vue3 组合式 API 中，setup() 函数的执行时机是什么时候？',
            type: '单选题',
            score: 5,
            options: [
              { label: '在组件创建之前执行', value: 'A' },
              { label: '在组件创建之后，挂载之前执行', value: 'B' },
              { label: '在组件挂载之后执行', value: 'C' },
              { label: '在组件更新时执行', value: 'D' }
            ],
            correctAnswer: 'B'
          },
          {
            id: 2,
            title: '以下哪些是 Vue3 组合式 API 的优点？（多选）',
            type: '多选题',
            score: 5,
            options: [
              { label: '更好的逻辑复用', value: 'A' },
              { label: '更灵活的代码组织', value: 'B' },
              { label: '更好的 TypeScript 支持', value: 'C' },
              { label: '更小的包体积', value: 'D' }
            ],
            correctAnswer: ['A', 'B', 'C']
          },
          {
            id: 3,
            title: 'Vue3 的 ref 和 reactive 都可以用来创建响应式数据。',
            type: '判断题',
            score: 5,
            correctAnswer: 'true'
          },
          {
            id: 4,
            title: '请简述 Vue3 组合式 API 中 watch 和 watchEffect 的区别。',
            type: '简答题',
            score: 10,
            correctAnswer: 'watch 需要指定监听的数据源，而 watchEffect 会自动收集依赖；watch 可以访问新旧值，watchEffect 只能访问当前值；watchEffect 在组件初始化时立即执行一次，而 watch 只在数据变化时执行。'
          }
        ]
      })

      // 当前题目索引
      const currentQuestionIndex = ref(0)

      // 用户答案数组
      const currentAnswers = ref([])

      // 初始化答案数组
      const initAnswers = () => {
        currentAnswers.value = examData.value.questions.map(() => {
          return null
        })
      }

      // 计时器相关
      const timeLeft = ref(examData.value.duration * 60) // 转换为秒
      const timer = ref(null)
      const examEnded = ref(false)

      // 格式化时间显示
      const formattedTime = computed(() => {
        const minutes = Math.floor(timeLeft.value / 60)
        const seconds = timeLeft.value % 60
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
      })

      // 已答题数量
      const answeredCount = computed(() => {
        return currentAnswers.value.filter(answer => answer !== null && answer !== '').length
      })

      // 未答题数量
      const unansweredCount = computed(() => {
        return examData.value.questions.length - answeredCount.value
      })

      // 保存答案
      const saveAnswer = () => {
        // 这里可以添加AJAX请求保存到服务器
        ElMessage.success('答案已保存')
      }

      // 上一题
      const prevQuestion = () => {
        if (currentQuestionIndex.value > 0) {
          currentQuestionIndex.value--
        }
      }

      // 下一题
      const nextQuestion = () => {
        if (currentQuestionIndex.value < examData.value.questions.length - 1) {
          currentQuestionIndex.value++
        }
      }

      // 跳转到指定题目
      const goToQuestion = (index) => {
        currentQuestionIndex.value = index
      }

      // 获取题目按钮类型
      const getQuestionButtonType = (index) => {

        if (currentAnswers.value[index] === null || currentAnswers.value[index] === '') {
          return 'info' // 未答题
        }
        return 'success' // 已答题
      }

      // 提交试卷
      const submitExam = async () => {
        if (examEnded.value) {
          ElMessage.warning('考试时间已结束，已自动提交')
          return
        }

        try {
          await ElMessageBox.confirm('确定要提交试卷吗？提交后将无法修改答案。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })

          // 停止计时器
          clearInterval(timer.value)
          examEnded.value = true

          // 计算得分（示例逻辑）
          let score = 0
          examData.value.questions.forEach((question, index) => {
            const userAnswer = currentAnswers.value[index]
            if (question.type === '单选题' || question.type === '判断题') {
              if (userAnswer === question.correctAnswer) {
                score += question.score
              }
            } else if (question.type === '多选题') {
              if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
                const isCorrect = userAnswer.length === question.correctAnswer.length &&
                  userAnswer.every(val => question.correctAnswer.includes(val))
                if (isCorrect) {
                  score += question.score
                }
              }
            } else {
              // 简答题简单处理，实际应用中应该由老师评分
              if (userAnswer && userAnswer.length > 10) {
                score += question.score * 0.7 // 假设简答题给70%分数
              }
            }
          })

          // 这里可以添加提交到服务器的逻辑

          ElMessage.success(`提交成功！您的得分是 ${score} 分`)

          // 模拟提交后跳转
          // setTimeout(() => {
          //   router.push('/exam/result')
          // }, 1500)

        } catch (error) {
        }
      }

      // 启动计时器
      const startTimer = () => {
        timer.value = setInterval(() => {
          if (timeLeft.value > 0) {
            timeLeft.value--

            // 考试结束
            if (timeLeft.value === 0) {
              examEnded.value = true
              clearInterval(timer.value)
              ElMessage.warning('考试时间结束，已自动提交试卷')
              submitExam()
            }
          }
        }, 1000)
      }

      // 组件挂载时初始化
      onMounted(() => {
        initAnswers()
        startTimer()
      })

      // 组件卸载前清理
      onBeforeUnmount(() => {
        if (timer.value) {
          clearInterval(timer.value)
        }
      })

      return {
        examData,
        currentQuestionIndex,
        currentAnswers,
        timeLeft,
        formattedTime,
        answeredCount,
        unansweredCount,
        examEnded,
        saveAnswer,
        prevQuestion,
        nextQuestion,
        goToQuestion,
        getQuestionButtonType,
        submitExam
      }
    }
  }
  </script>

  <style scoped>
  .exam-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
  }

  .exam-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .exam-title {
    font-size: 20px;
    font-weight: bold;

  }

  .exam-info span {
    margin-right: 15px;
  }

  .question-nav {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .question-content {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;
    background-color: #fff;
  }

  .question-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    gap: 15px;
    color: #666;
  }

  .question-body {
    margin-bottom: 30px;
  }

  .question-body h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .el-radio, .el-checkbox {
    display: block;
    margin: 10px 0;
  }

  .question-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
  }

  .timer {
    font-size: 16px;
    font-weight: bold;
  }
  </style>