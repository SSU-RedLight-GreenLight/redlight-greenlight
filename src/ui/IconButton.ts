import p5 from "p5";

/**
 * 아이콘 버튼 클래스
 * 작은 원형 아이콘 버튼 (크레딧, 설정 등)
 */
export class IconButton {
  private p: p5;
  private x: number;
  private y: number;
  private size: number;
  private icon: string;
  private onClick: () => void;
  private isHovered: boolean = false;

  // 스타일 설정
  private bgColor: p5.Color;
  private hoverColor: p5.Color;
  private iconColor: p5.Color;

  constructor(
    p5Instance: p5,
    x: number,
    y: number,
    size: number,
    icon: string,
    onClick: () => void,
    options?: {
      bgColor?: p5.Color;
      hoverColor?: p5.Color;
      iconColor?: p5.Color;
    }
  ) {
    this.p = p5Instance;
    this.x = x;
    this.y = y;
    this.size = size;
    this.icon = icon;
    this.onClick = onClick;

    // 기본 스타일 설정
    this.bgColor = options?.bgColor || this.p.color(0, 0, 0, 100);
    this.hoverColor = options?.hoverColor || this.p.color(0, 0, 0, 180);
    this.iconColor = options?.iconColor || this.p.color(255);
  }

  /**
   * 버튼 그리기
   */
  draw(): void {
    // 마우스 호버 체크
    this.checkHover();

    // 버튼 배경 (원형)
    this.p.push();
    this.p.fill(this.isHovered ? this.hoverColor : this.bgColor);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);

    // 아이콘 텍스트
    this.p.fill(this.iconColor);
    this.p.textSize(this.size * 0.5);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(this.icon, this.x, this.y);
    this.p.pop();
  }

  /**
   * 마우스 호버 체크
   */
  private checkHover(): void {
    const distance = this.p.dist(this.p.mouseX, this.p.mouseY, this.x, this.y);
    this.isHovered = distance <= this.size / 2;

    // 호버 시 커서 변경
    if (this.isHovered) {
      this.p.cursor(this.p.HAND);
    }
  }

  /**
   * 마우스 클릭 처리
   */
  handleClick(): void {
    if (this.isHovered) {
      this.onClick();
    }
  }

  /**
   * 호버 상태 확인
   */
  getIsHovered(): boolean {
    return this.isHovered;
  }
}
