import p5 from "p5";

/**
 * 에셋 관리 클래스 (싱글톤)
 * 모든 씬에서 공유되는 이미지, 사운드 등을 관리
 */
export class AssetManager {
  private static instance: AssetManager;

  // 이미지 에셋
  public imgBackground: p5.Image | undefined;

  private constructor() {}

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * 배경 이미지 로드
   */
  loadBackgroundImage(p: p5, path: string): void {
    p.loadImage(
      `${import.meta.env.BASE_URL}${path}`,
      (img) => {
        this.imgBackground = img;
        console.log("✅ 배경 이미지 로드 성공");
      },
      (err) => {
        console.error("❌ 배경 이미지 로드 실패:", err);
      }
    );
  }
}
