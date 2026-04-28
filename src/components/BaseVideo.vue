<template>
  <div class="video-player">
    <video
      ref="videoElement"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      :width="width"
      :height="height"
      @fullscreenchange="handleFullscreenChange"
    >
      您的浏览器不支持 HTML5 视频标签。
      <source :src="videoSrc" type="video/mp4" />
      <source :src="videoSrc" type="video/ogg">
      <source :src="videoSrc" type="video/WebM">

      <div>dddddddddd</div>
    </video>
    <div class="controls" v-if="drag"></div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted, watch,onBeforeUnmount } from "vue";

export default {
  name: "VideoPlayer",
  props: {
    src: {
      type: String,
      required: true,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 600,
    },
    height: {
      type: Number,
      default: 360,
    },
    //能否拖动进度条
    drag: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const videoElement = ref(null);
    const error = ref(null);
    const isPlaying = ref(false);
    const videoPlayer = ref(null);
    let isFullscreen = false;
    const onPlay = () => {
      isPlaying.value = true;
      error.value = null;
    };

    const onPause = () => {
      isPlaying.value = false;
    };

    const onEnded = () => {
      emit("ended");
      isPlaying.value = false;
    };

    const play = () => {
      if (videoElement.value) {
        const promise = videoElement.value.play();
        if (promise !== undefined) {
          promise.catch((err) => {
            error.value = `播放失败: ${err.message}`;
          });
        }
      }
    };

    const pause = () => {
      if (videoElement.value) {
        videoElement.value.pause();
      }
    };

    // 阻止进度条拖动

    // 监听 src 变化
    watch(
      () => props.src,
      (newSrc) => {
        if (videoElement.value) {
          videoElement.value.src = newSrc;
        }
      }
    );

    return {
      videoElement,
      error,
      isPlaying,
      videoSrc: props.src,
      controls: props.controls,
      autoplay: props.autoplay,
      loop: props.loop,
      muted: props.muted,
      onPlay,
      onPause,
      onEnded,
      play,
      pause,
    };
  },
};
</script>

<style scoped lang="less">
.video-player {
  position: relative;
  .controls {
    width: 100%;
    height: 30px;
    bottom: 7px;
    background: rgba(0, 0, 0, 0.1); /* 半透明遮罩 */
    position: absolute;
  }
}

video {
  max-width: 100%;
  height: auto;
  background-color: #000;
}

.error-message {
  color: red;
  margin-top: 8px;
}
</style>
