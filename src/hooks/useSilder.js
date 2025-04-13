import { useEffect } from 'react';

const useSlider = (containerId, leftBtnId, rightBtnId) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);

    if (!container || !leftBtn || !rightBtn) return;

    const scrollAmount = 300;

    leftBtn.addEventListener('click', () => {
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    rightBtn.addEventListener('click', () => {
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    return () => {
      leftBtn.removeEventListener('click', () => {});
      rightBtn.removeEventListener('click', () => {});
    };
  }, [containerId, leftBtnId, rightBtnId]);
};

export default useSlider;
