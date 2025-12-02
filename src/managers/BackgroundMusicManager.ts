/**
 * 배경음악 관리 클래스
 * - 게임 씬에 따라 배경음악 자동 전환
 * - 무한 재생 및 한 번만 재생 지원
 */
export class BackgroundMusicManager {
  private currentScene: string = "";
  private currentAudio: HTMLAudioElement | null = null;
  private audioMap: Map<string, HTMLAudioElement> = new Map();
  private isInitialized: boolean = false; // 사용자 상호작용 후 초기화 여부

  constructor() {
    // 배경음악 파일 로드
    this.loadAudio("START", "assets/game_main.mp3", true);
    this.loadAudio("PLAYING", "assets/game_play.mp3", true);
    this.loadAudio("WIN", "assets/game_clear.mp3", false);
    this.loadAudio("LOSE", "assets/game_over.mp3", false);
  }

  /**
   * 오디오 파일 로드
   */
  private loadAudio(key: string, path: string, loop: boolean): void {
    const audio = new Audio(`${import.meta.env.BASE_URL}${path}`);
    audio.loop = loop;
    audio.volume = 0.5; // 볼륨 50%로 설정
    this.audioMap.set(key, audio);
    console.log(`🎵 배경음악 로드: ${key} (${path}) - loop: ${loop}`);
  }

  /**
   * 사용자 상호작용으로 음악 시스템 초기화
   * (브라우저 자동 재생 정책 우회)
   */
  initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log("🎵 배경음악 시스템 초기화됨 (사용자 상호작용 감지)");
  }

  /**
   * 음악 시스템 초기화 여부 확인
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 씬에 맞는 배경음악 재생
   */
  playMusicForScene(scene: string): void {
    // 이미 같은 씬의 음악이 재생 중이면 무시
    if (
      this.currentScene === scene &&
      this.currentAudio &&
      !this.currentAudio.paused
    ) {
      return;
    }

    // 현재 재생 중인 음악 정지
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // 씬에 맞는 음악 선택
    let audioKey = scene;
    if (scene === "LOSE_CAUGHT" || scene === "LOSE_TIME") {
      audioKey = "LOSE"; // LOSE_CAUGHT, LOSE_TIME 모두 game_over.mp3 사용
    }

    const audio = this.audioMap.get(audioKey);
    if (audio) {
      this.currentAudio = audio;
      this.currentScene = scene;

      // 재생 시도 (브라우저가 허용하면 즉시 재생, 아니면 사용자 상호작용 필요)
      audio
        .play()
        .then(() => {
          console.log(`🎵 배경음악 재생: ${scene}`);
          this.isInitialized = true; // 재생 성공 시 초기화 플래그 설정
        })
        .catch((err) => {
          if (!this.isInitialized) {
            console.log(`⏸️ 배경음악 대기 중 (사용자 상호작용 필요): ${scene}`);
          } else {
            console.warn(`⚠️ 배경음악 재생 실패: ${err.message}`);
          }
        });
    } else {
      console.warn(`⚠️ 씬에 맞는 배경음악을 찾을 수 없음: ${scene}`);
    }
  }

  /**
   * 모든 배경음악 정지
   */
  stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentScene = "";
  }
}
