import p5 from "p5";

let xPos: number, xDir: number; // 공의 x축 위치와 진행 방향
let yPos: number, yDir: number; // 공의 y축 위치와 진행 방향
let diam: number;
let speed: number; // 공의 속도

let padWidth: number = 100;
let padHeight: number = 20;

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    speed = 20;
    xPos = p.width / 2; // 공을 화면의 중심에서 출발
    xDir = speed;
    yPos = p.height / 2;
    yDir = speed;
    diam = 50;
  };

  p.draw = () => {
    p.background("#FAFAFA");

    // ball drawing and movement
    drawBall(xPos, yPos, diam);
    xPos = xPos + xDir;
    yPos = yPos + yDir;

    // ball bouncing
    ballCollision();

    // Draw pad
    drawPad(p.mouseX, p.mouseY);
  };

  const drawBall = (xPos: number, yPos: number, diameter: number) => {
    p.ellipse(xPos, yPos, diameter, diameter);
  }

  const drawPad = (mouseX: number, mouseY: number) => {
    // 패드의 위치 계산
    // 패드의 y는 위치가 고정
    let xPos = mouseX - padWidth / 2;
    let yPos = p.height - 100;
    p.rect(xPos, yPos, padWidth, padHeight);
  };

  /// 공이 부딪힐 경우 진행방향의 반대 방향으로 이동
  const ballCollision = () => {
    if (xPos - diam / 2 < 0) xDir *= -1;
    if (xPos + diam / 2 > p.width) xDir *= -1;

    if (yPos - diam / 2 < 0) yDir *= -1;
    if (yPos + diam / 2 > p.height) yDir *= -1;

    // 패드(막대) 충돌 처리: 패드는 y가 고정된 가로 직사각형이므로 세로 반사(yDir 반전)가 맞습니다.
    const padX = p.mouseX - padWidth / 2;
    const padY = p.height - 100;
    const padRight = padX + padWidth;
    const padBottom = padY + padHeight;

    // 공이 아래로 내려오고 있을 때에만 패드와의 충돌 체크 (중복 반사 방지)
    const movingDown = yDir > 0;
    const ballLeft = xPos - diam / 2;
    const ballRight = xPos + diam / 2;
    const ballTop = yPos - diam / 2;
    const ballBottom = yPos + diam / 2;

    const overlapX = ballRight >= padX && ballLeft <= padRight;
    const overlapY = ballBottom >= padY && ballTop <= padBottom;

    if (movingDown && overlapX && overlapY) {
      // 수직 반사
      yDir *= -1;
      // 공을 패드 바로 위로 올려서 끼임 방지
      yPos = padY - diam / 2;

      // 패드의 중앙에서 얼마나 떨어졌는지에 따라 x 속도를 조금 조정 (반사 각도 효과)
      const padCenterX = padX + padWidth / 2;
      const hitOffset = (xPos - padCenterX) / (padWidth / 2); // -1 ~ 1
      // x 성분을 오프셋에 비례하게 조정
      xDir += hitOffset * 0.5 * speed;

      // 전체 속도 크기를 speed로 정규화하여 너무 빠르거나 느려지지 않게 유지
      const mag = Math.sqrt(xDir * xDir + yDir * yDir);
      if (mag > 0) {
        const scale = speed / mag;
        xDir *= scale;
        yDir *= scale;
      }
    }
  };
};

new p5(sketch);
