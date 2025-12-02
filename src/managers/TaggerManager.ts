import p5 from "p5";

/* ---------------------------------
 * 술래 시스템 타입 정의
 * --------------------------------- */
export interface TaggerConfig {
  id: string; // 술래 고유 ID (예: "1ju", "professor", "robot")
  name: string; // 술래 이름 (예: "1주차", "교수님", "로봇")
  voicePath: string; // 음성 파일 경로
  greenSpritePath: string; // 초록불(뒷모습) 스프라이트 경로
  redSpritePaths: string[]; // 빨간불(앞모습) 스프라이트 경로 배열 (여러 개 가능)
}

export interface LoadedTagger {
  config: TaggerConfig;
  voiceAudio: HTMLAudioElement;
  greenSprite: p5.Image | undefined;
  redSprites: (p5.Image | undefined)[];
}

/**
 * 술래 관리 클래스
 * - 여러 술래를 등록하고 랜덤으로 선택
 * - 음성과 스프라이트를 1:1로 연동
 * - 술래마다 여러 개의 빨간불 스프라이트 지원
 */
export class TaggerManager {
  private taggers: LoadedTagger[] = [];
  private currentTagger: LoadedTagger | null = null;
  private currentRedSpriteIndex: number = 0;
  private p5Instance: p5;
  private isVoicePlaying: boolean = false;
  private onVoiceEndCallback: (() => void) | null = null;

  constructor(p5Instance: p5) {
    this.p5Instance = p5Instance;
  }

  /**
   * 술래 등록 및 에셋 로드
   */
  loadTagger(config: TaggerConfig): void {
    const tagger: LoadedTagger = {
      config,
      voiceAudio: new Audio(`${import.meta.env.BASE_URL}${config.voicePath}`),
      greenSprite: undefined,
      redSprites: [],
    };

    // 음성 종료 이벤트 리스너
    tagger.voiceAudio.addEventListener("ended", () => {
      console.log(`✅ [${config.name}] 음성 재생 완료`);
      this.isVoicePlaying = false;
      if (this.onVoiceEndCallback) {
        this.onVoiceEndCallback();
      }
    });

    // 초록불 스프라이트 로드
    this.p5Instance.loadImage(
      `${import.meta.env.BASE_URL}${config.greenSpritePath}`,
      (img) => {
        tagger.greenSprite = img;
        console.log(`✅ [${config.name}] 초록불 스프라이트 로드 성공`);
      },
      (err) => {
        console.error(`❌ [${config.name}] 초록불 스프라이트 로드 실패:`, err);
      }
    );

    // 빨간불 스프라이트들 로드
    config.redSpritePaths.forEach((path, index) => {
      this.p5Instance.loadImage(
        `${import.meta.env.BASE_URL}${path}`,
        (img) => {
          tagger.redSprites[index] = img;
          console.log(
            `✅ [${config.name}] 빨간불 스프라이트 ${index + 1} 로드 성공`
          );
        },
        (err) => {
          console.error(
            `❌ [${config.name}] 빨간불 스프라이트 ${index + 1} 로드 실패:`,
            err
          );
        }
      );
    });

    this.taggers.push(tagger);
    console.log(`✅ 술래 등록 완료: ${config.name}`);
  }

  /**
   * 랜덤으로 술래 선택
   */
  selectRandomTagger(): void {
    if (this.taggers.length === 0) {
      console.error("❌ 등록된 술래가 없습니다!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.taggers.length);
    this.currentTagger = this.taggers[randomIndex];
    console.log(`🎲 랜덤 술래 선택: ${this.currentTagger.config.name}`);
  }

  /**
   * 음성 재생 시작
   */
  playVoice(): void {
    if (!this.currentTagger) {
      console.error("❌ 선택된 술래가 없습니다!");
      return;
    }

    if (this.isVoicePlaying) {
      console.warn("⚠️ 이미 음성이 재생 중입니다.");
      return;
    }

    // 빨간불 스프라이트 랜덤 선택
    const redSpritesCount = this.currentTagger.config.redSpritePaths.length;
    this.currentRedSpriteIndex = Math.floor(Math.random() * redSpritesCount);

    this.currentTagger.voiceAudio.currentTime = 0;
    this.currentTagger.voiceAudio.play();
    this.isVoicePlaying = true;
    console.log(
      `🔊 [${
        this.currentTagger.config.name
      }] 음성 재생 시작 (빨간불 스프라이트: ${this.currentRedSpriteIndex + 1})`
    );
  }

  /**
   * 음성 정지
   */
  stopVoice(): void {
    if (this.currentTagger) {
      this.currentTagger.voiceAudio.pause();
      this.currentTagger.voiceAudio.currentTime = 0;
      this.isVoicePlaying = false;
    }
  }

  /**
   * 음성 종료 콜백 설정
   */
  setOnVoiceEnd(callback: () => void): void {
    this.onVoiceEndCallback = callback;
  }

  /**
   * 현재 술래의 초록불 스프라이트 가져오기
   */
  getCurrentGreenSprite(): p5.Image | undefined {
    return this.currentTagger?.greenSprite;
  }

  /**
   * 현재 술래의 빨간불 스프라이트 가져오기 (현재 선택된 것)
   */
  getCurrentRedSprite(): p5.Image | undefined {
    if (!this.currentTagger) return undefined;
    return this.currentTagger.redSprites[this.currentRedSpriteIndex];
  }

  /**
   * 음성 재생 중인지 확인
   */
  isPlaying(): boolean {
    return this.isVoicePlaying;
  }

  /**
   * 현재 술래 정보 가져오기
   */
  getCurrentTagger(): LoadedTagger | null {
    return this.currentTagger;
  }
}
