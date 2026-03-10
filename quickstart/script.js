/**
 * 个人网站 JavaScript 功能
 * 
 * 这个文件包含了网站的基本交互功能：
 * - 移动端菜单切换
 * - 平滑滚动
 * - 导航栏高亮
 */

// ============================================
// DOM 加载完成后执行
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initMobileMenu();
    initSmoothScroll();
    initNavbarHighlight();
    initScrollToTop();
});

// ============================================
// 移动端菜单功能
// ============================================

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) {
        return; // 如果元素不存在，直接返回
    }
    
    // 点击菜单按钮时切换菜单显示/隐藏
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // 切换按钮动画（可选）
        const spans = menuToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            // 菜单打开时的动画
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            // 菜单关闭时恢复
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // 点击菜单项后关闭移动端菜单
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            // 恢复按钮样式
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // 点击页面其他地方时关闭菜单
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || 
                                 menuToggle.contains(event.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ============================================
// 平滑滚动功能
// ============================================

function initSmoothScroll() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是空链接或只是 #，不处理
            if (href === '#' || href === '') {
                return;
            }
            
            const targetId = href.substring(1); // 去掉 # 号
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault(); // 阻止默认跳转行为
                
                // 计算目标位置（考虑固定导航栏的高度）
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                // 平滑滚动到目标位置
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 导航栏高亮功能
// ============================================

function initNavbarHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        let current = '';
        
        // 找到当前滚动位置对应的区域
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const navHeight = document.querySelector('.navbar').offsetHeight;
            
            if (window.pageYOffset >= (sectionTop - navHeight - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        // 更新导航链接的激活状态
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// 返回顶部按钮功能（可选）
// ============================================

function initScrollToTop() {
    // 创建返回顶部按钮
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.setAttribute('aria-label', '返回顶部');
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // 滚动时显示/隐藏按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });
    
    // 点击返回顶部
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 悬停效果
    scrollTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = '#357abd';
    });
    
    scrollTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = 'var(--primary-color)';
    });
}

// ============================================
// 工具函数
// ============================================

/**
 * 防抖函数 - 限制函数执行频率
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 示例：使用防抖优化滚动事件
// window.addEventListener('scroll', debounce(function() {
//     // 你的滚动处理代码
// }, 100));


