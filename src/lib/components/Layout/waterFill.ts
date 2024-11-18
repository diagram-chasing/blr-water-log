interface WaterFillOptions {
  bubbleCount?: number;
  fillHeight?: string;
  fillColor?: string;
}

export function waterFill(node: HTMLElement, options: WaterFillOptions = {}) {
  const {
    bubbleCount = 5,
    fillHeight = '45%',
    fillColor = 'rgba(175, 224, 228, 0.7)'
  } = options;

  node.style.position = 'relative';
  node.style.overflow = 'hidden';

  const fill = document.createElement('div');
  fill.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    background: ${fillColor};
    transition: height 0.5s cubic-bezier(0.42, 0, 0.58, 1);
    z-index: 1;
  `;
  node.appendChild(fill);

  const bubbles = Array.from({ length: bubbleCount }, () => {
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      position: absolute;
      bottom: 0;
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
      z-index: 2;
    `;
    node.appendChild(bubble);
    return bubble;
  });

  function animateBubble(bubble: HTMLElement) {
    const left = Math.random() * 100;
    bubble.style.left = `${left}%`;
    bubble.style.transition = 'none';
    bubble.style.transform = 'translateY(0)';
    bubble.style.opacity = '0';

    requestAnimationFrame(() => {
      bubble.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
      bubble.style.transform = 'translateY(-20px)';
      bubble.style.opacity = '1';

      setTimeout(() => {
        bubble.style.opacity = '0';
      }, 700);
    });
  }

  let bubbleInterval: number;

  function startBubbles() {
    fill.style.height = fillHeight;
    bubbles.forEach((bubble, i) => {
      setTimeout(() => animateBubble(bubble), i * 200);
    });
    bubbleInterval = window.setInterval(() => {
      bubbles.forEach((bubble, i) => {
        setTimeout(() => animateBubble(bubble), i * 200);
      });
    }, bubbleCount * 200);
  }

  function stopBubbles() {
    fill.style.height = '0';
    clearInterval(bubbleInterval);
    bubbles.forEach(bubble => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(0)';
    });
  }

  node.addEventListener('mouseenter', startBubbles);
  node.addEventListener('mouseleave', stopBubbles);

  return {
    destroy() {
      clearInterval(bubbleInterval);
      node.removeEventListener('mouseenter', startBubbles);
      node.removeEventListener('mouseleave', stopBubbles);
      bubbles.forEach(bubble => bubble.remove());
      fill.remove();
    },
    update(newOptions: WaterFillOptions) {
      Object.assign(options, newOptions);
      fill.style.background = options.fillColor!;
    }
  };
}
