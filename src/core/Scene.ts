import p5 from "p5";

/**
 * 씬 기본 인터페이스
 * 모든 게임 씬은 이 인터페이스를 구현해야 합니다.
 */
export interface Scene {
  /**
   * 씬 초기화 (씬 전환 시 호출)
   */
  init(): void;

  /**
   * 씬 업데이트 (매 프레임 호출)
   */
  update(): void;

  /**
   * 씬 렌더링 (매 프레임 호출)
   */
  draw(): void;

  /**
   * 키 입력 처리
   */
  keyPressed(): void;

  /**
   * 키 릴리즈 처리
   */
  keyReleased(): void;

  /**
   * 마우스 클릭 처리
   */
  mousePressed(): void;

  /**
   * 씬 정리 (씬 전환 전 호출)
   */
  cleanup(): void;
}

/**
 * 씬 기본 추상 클래스
 */
export abstract class BaseScene implements Scene {
  protected p: p5;

  constructor(p5Instance: p5) {
    this.p = p5Instance;
  }

  abstract init(): void;
  abstract update(): void;
  abstract draw(): void;

  keyPressed(): void {
    // 기본 구현 (필요시 오버라이드)
  }

  keyReleased(): void {
    // 기본 구현 (필요시 오버라이드)
  }

  mousePressed(): void {
    // 기본 구현 (필요시 오버라이드)
  }

  cleanup(): void {
    // 기본 구현 (필요시 오버라이드)
  }
}
