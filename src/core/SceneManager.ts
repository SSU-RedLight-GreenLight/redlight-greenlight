import { Scene } from "./Scene";

/**
 * 씬 관리 클래스
 * - 씬 전환 관리
 * - 현재 씬의 생명주기 관리
 */
export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneName: string = "";

  constructor() {
    // SceneManager는 p5 인스턴스를 직접 사용하지 않음
  }

  /**
   * 씬 등록
   */
  addScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
    console.log(`✅ 씬 등록: ${name}`);
  }

  /**
   * 씬 전환
   */
  switchTo(name: string): void {
    const nextScene = this.scenes.get(name);
    if (!nextScene) {
      console.error(`❌ 씬을 찾을 수 없음: ${name}`);
      return;
    }

    // 현재 씬 정리
    if (this.currentScene) {
      this.currentScene.cleanup();
    }

    // 새 씬 초기화
    this.currentScene = nextScene;
    this.currentSceneName = name;
    this.currentScene.init();

    console.log(`🎬 씬 전환: ${name}`);
  }

  /**
   * 현재 씬 업데이트
   */
  update(): void {
    if (this.currentScene) {
      this.currentScene.update();
    }
  }

  /**
   * 현재 씬 렌더링
   */
  draw(): void {
    if (this.currentScene) {
      this.currentScene.draw();
    }
  }

  /**
   * 키 입력 전달
   */
  keyPressed(): void {
    if (this.currentScene) {
      this.currentScene.keyPressed();
    }
  }

  /**
   * 키 릴리즈 전달
   */
  keyReleased(): void {
    if (this.currentScene) {
      this.currentScene.keyReleased();
    }
  }

  /**
   * 마우스 클릭 전달
   */
  mousePressed(): void {
    if (this.currentScene) {
      this.currentScene.mousePressed();
    }
  }

  /**
   * 현재 씬 이름 가져오기
   */
  getCurrentSceneName(): string {
    return this.currentSceneName;
  }

  /**
   * 현재 씬 가져오기
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
}
