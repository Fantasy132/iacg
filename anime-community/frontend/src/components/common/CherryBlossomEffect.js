import React, { useEffect, useRef } from 'react';
import './CherryBlossomEffect.css';

const CherryBlossomEffect = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let particles = [];
    let animationFrameId;

    // 创建樱花粒子
    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'cherry-blossom';
      
      // 随机大小
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 随机颜色（粉色系）
      const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#f8c8dc'];
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // 设置初始位置
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // 随机旋转
      const rotation = Math.random() * 360;
      particle.style.transform = `rotate(${rotation}deg)`;
      
      container.appendChild(particle);
      
      // 动画参数
      const particleData = {
        element: particle,
        x: x,
        y: y,
        size: size,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2 + 1,
        rotation: rotation,
        rotationSpeed: (Math.random() - 0.5) * 5,
        opacity: 1,
        life: 1
      };
      
      particles.push(particleData);
    };

    // 更新粒子动画
    const updateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // 更新位置
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.life -= 0.01;
        p.opacity = Math.max(0, p.life);
        
        // 应用变化
        p.element.style.left = `${p.x}px`;
        p.element.style.top = `${p.y}px`;
        p.element.style.transform = `rotate(${p.rotation}deg)`;
        p.element.style.opacity = p.opacity;
        
        // 移除生命周期结束的粒子
        if (p.life <= 0) {
          p.element.remove();
          particles.splice(i, 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(updateParticles);
    };

    // 鼠标移动事件处理
    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY);
    };

    // 触摸移动事件处理（移动端支持）
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        createParticle(touch.clientX, touch.clientY);
      }
    };

    // 添加事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // 开始动画循环
    updateParticles();

    // 清理函数
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
      particles.forEach(p => p.element.remove());
      particles = [];
    };
  }, []);

  return <div ref={containerRef} className="cherry-blossom-container"></div>;
};

export default CherryBlossomEffect;