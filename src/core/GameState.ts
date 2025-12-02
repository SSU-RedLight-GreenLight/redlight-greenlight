/**
 * 전역 게임 상태
 * 씬 간 공유되는 데이터
 */
export interface GameData {
  distance: number; // 남은 거리 (m)
  timeLeft: number; // 남은 시간 (초)
  isRedLight: boolean; // 빨간불(뒤돌아봄) 여부
  subtitle: string; // 현재 자막 ("무", "무궁화...")
}

/**
 * 게임 상태 관리 클래스 (싱글톤)
 */
export class GameState {
  private static instance: GameState;
  
  public data: GameData = {
    distance: 50.0,
    timeLeft: 60,
    isRedLight: false,
    subtitle: "",
  };

  // 게임 로직 내부 변수
  public lastSecondUpdate: number = 0;
  public redLightStartTime: number = 0;
  public currentPhase: "green" | "red" = "green";
  public spacePressed: boolean = false;

  private constructor() {}

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * 게임 데이터 초기화
   */
  reset(): void {
    this.data.distance = 50.0;
    this.data.timeLeft = 60;
    this.data.isRedLight = false;
    this.data.subtitle = "";

    this.lastSecondUpdate = 0;
    this.redLightStartTime = 0;
    this.currentPhase = "green";
    this.spacePressed = false;

    console.log("🔄 게임 상태 초기화");
  }
}
