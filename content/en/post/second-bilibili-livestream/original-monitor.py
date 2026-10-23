from flask import Flask, render_template_string, jsonify
from flask_cors import CORS
from bilibili_api import video
import asyncio
import threading
import time
from datetime import datetime

# ==================== 配置区域 ====================
# 视频1：崩坏：星穹铁道
VIDEO_BV_1 = "BV1HfKiz3Ezf"
VIDEO_NAME_1 = "《崩坏：星穹铁道》白厄角色PV——「日冕」"

# 视频2：明日方舟
VIDEO_BV_2 = "BV1fy4y1L7Rq"
VIDEO_NAME_2 = "《明日方舟》夏日嘉年华限时活动宣传PV"

# 更新间隔（秒）——建议调至5秒以上避免风控
UPDATE_INTERVAL = 5
# =================================================

app = Flask(__name__)
CORS(app)

# 全局变量，存储两个视频的数据
comment_data = {
    'video1': {'count': 0, 'history': []},
    'video2': {'count': 0, 'history': []},
    'last_update': None
}

async def fetch_comment_count(bvid):
    """获取单个视频评论数"""
    try:
        v = video.Video(bvid=bvid)
        info = await v.get_info()
        return info['stat']['reply']
    except Exception as e:
        print(f"获取视频 {bvid} 数据失败: {e}")
        return None

def update_comment_counts():
    """后台线程：定时更新两个视频的评论数"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    while True:
        try:
            tasks = [
                fetch_comment_count(VIDEO_BV_1),
                fetch_comment_count(VIDEO_BV_2)
            ]
            results = loop.run_until_complete(asyncio.gather(*tasks))
            count1, count2 = results
            now = datetime.now().strftime("%H:%M:%S")

            # 更新视频1
            if count1 is not None:
                comment_data['video1']['count'] = count1
                comment_data['video1']['history'].append({'time': now, 'count': count1})
                if len(comment_data['video1']['history']) > 30:
                    comment_data['video1']['history'] = comment_data['video1']['history'][-30:]

            # 更新视频2
            if count2 is not None:
                comment_data['video2']['count'] = count2
                comment_data['video2']['history'].append({'time': now, 'count': count2})
                if len(comment_data['video2']['history']) > 30:
                    comment_data['video2']['history'] = comment_data['video2']['history'][-30:]

            comment_data['last_update'] = now
            print(f"数据已更新: {now} - 视频1: {count1}, 视频2: {count2}")

        except Exception as e:
            print(f"更新循环出错: {e}")

        time.sleep(UPDATE_INTERVAL)

@app.route('/api/comment-counts')
def get_comment_counts():
    """API接口：返回两个视频的最新数据"""
    return jsonify({
        'video1': {
            'name': VIDEO_NAME_1,
            'bvid': VIDEO_BV_1,
            'current': comment_data['video1']['count'],
            'history': comment_data['video1']['history']
        },
        'video2': {
            'name': VIDEO_NAME_2,
            'bvid': VIDEO_BV_2,
            'current': comment_data['video2']['count'],
            'history': comment_data['video2']['history']
        },
        'last_update': comment_data['last_update']
    })

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

# 启动后台线程
thread = threading.Thread(target=update_comment_counts, daemon=True)
thread.start()

# ==================== 前端模板（双视频夜间模式版） ====================
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B站双视频评论数实时对比 · 夜间模式</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            margin: 20px;
            background-color: #121212;
            color: #e0e0e0;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #ffffff; }
        .header p { color: #aaa; }
        
        /* 顶部双卡片 */
        .cards { display: flex; gap: 20px; margin-bottom: 30px; }
        .card {
            flex: 1;
            background: #1e1e1e;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-5px); box-shadow: 0 6px 16px rgba(0,0,0,0.7); }
        .card h2 { margin: 0 0 10px 0; color: #bbb; font-size: 1.2rem; }
        .card .video-name { font-size: 1.1rem; font-weight: bold; color: #fff; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card .bvid { color: #888; font-size: 0.8rem; margin-bottom: 20px; }
        .card .count { font-size: 4rem; font-weight: bold; color: #80cbc4; line-height: 1.2; }
        .card1 { border-top: 5px solid #fb7299; }
        .card2 { border-top: 5px solid #ff9f1c; }
        
        /* 底部：折线图 + 增速面板 */
        .bottom-container { display: flex; gap: 20px; margin-top: 20px; }
        .chart-container {
            flex: 2;
            background: #1e1e1e;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        #chart { width: 100%; height: 450px; }
        
        .growth-panel {
            flex: 1;
            background: #1e1e1e;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .growth-item {
            background: #2d2d2d;
            border-radius: 10px;
            padding: 15px;
        }
        .growth-item h3 {
            margin: 0 0 10px 0;
            font-size: 1.1rem;
            color: #ccc;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .growth-current {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 5px 0 10px 0;
        }
        .growth-current.positive { color: #4caf50; }
        .growth-current.negative { color: #f44336; }
        .growth-current.zero { color: #9e9e9e; }
        .history-list {
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 120px;
            overflow-y: auto;
            font-size: 0.9rem;
            border-top: 1px solid #444;
            padding-top: 8px;
        }
        .history-list li {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px dashed #3a3a3a;
        }
        .history-list .time { color: #aaa; }
        .history-list .value.positive { color: #4caf50; font-weight: 500; }
        .history-list .value.negative { color: #f44336; font-weight: 500; }
        .history-list .value.zero { color: #9e9e9e; }
        
        .update-info { text-align: center; margin-top: 20px; color: #888; font-size: 0.9rem; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.8rem; }
        
        .color-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
        .dot-pink { background: #fb7299; }
        .dot-orange { background: #ff9f1c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 B站双视频评论数实时对比 · 夜间模式</h1>
            <p>数据每 {{ UPDATE_INTERVAL }} 秒自动刷新 | 右侧面板显示实时增速及最近5次变化</p>
        </div>
        
        <!-- 顶部双卡片 -->
        <div class="cards">
            <div class="card card1" id="card1">
                <h2>🎬 视频 A</h2>
                <div class="video-name" id="name1">加载中...</div>
                <div class="bvid" id="bvid1"></div>
                <div class="count" id="count1">0</div>
            </div>
            <div class="card card2" id="card2">
                <h2>🎬 视频 B</h2>
                <div class="video-name" id="name2">加载中...</div>
                <div class="bvid" id="bvid2"></div>
                <div class="count" id="count2">0</div>
            </div>
        </div>
        
        <!-- 底部：折线图 + 增速面板 -->
        <div class="bottom-container">
            <!-- 左侧折线图 -->
            <div class="chart-container">
                <div id="chart"></div>
            </div>
            
            <!-- 右侧增速面板（两个区块） -->
            <div class="growth-panel">
                <div class="growth-item" id="growthVideo1">
                    <h3><span class="color-dot dot-pink"></span> 视频 A 增速</h3>
                    <div class="growth-current" id="growthCurrent1">--</div>
                    <ul class="history-list" id="growthHistory1"><li>等待数据...</li></ul>
                </div>
                <div class="growth-item" id="growthVideo2">
                    <h3><span class="color-dot dot-orange"></span> 视频 B 增速</h3>
                    <div class="growth-current" id="growthCurrent2">--</div>
                    <ul class="history-list" id="growthHistory2"><li>等待数据...</li></ul>
                </div>
            </div>
        </div>
        
        <div class="update-info" id="updateInfo">上次更新: --</div>
        <div class="footer">数据来源: B站API | 增速为相邻两次评论数差值 | 历史增速显示最近5次</div>
    </div>

    <script>
        // 初始化折线图（深色主题）
        const chartDom = document.getElementById('chart');
        const myChart = echarts.init(chartDom);
        
        let option = {
            backgroundColor: 'transparent',
            title: {
                text: '评论数变化趋势对比',
                left: 'center',
                textStyle: { color: '#ccc' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow', label: { backgroundColor: '#333' } }
            },
            legend: {
                data: [],
                top: 30,
                textStyle: { color: '#ccc' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                data: [],
                name: '时间',
                nameTextStyle: { color: '#aaa' },
                axisLabel: { color: '#aaa' },
                axisLine: { lineStyle: { color: '#555' } },
                axisTick: { lineStyle: { color: '#555' } }
            },
            yAxis: {
                type: 'value',
                name: '评论数',
                scale: true,
                nameTextStyle: { color: '#aaa' },
                axisLabel: { color: '#aaa' },
                axisLine: { lineStyle: { color: '#555' } },
                axisTick: { lineStyle: { color: '#555' } },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [
                { name: '视频 A', type: 'line', data: [], smooth: true, color: '#fb7299', symbol: 'circle' },
                { name: '视频 B', type: 'line', data: [], smooth: true, color: '#ff9f1c', symbol: 'diamond' }
            ]
        };
        myChart.setOption(option);

        // 增速更新函数
        function updateGrowthPanel(history, currentGrowthEl, historyListEl) {
            if (history.length < 2) {
                currentGrowthEl.innerText = '--';
                currentGrowthEl.className = 'growth-current zero';
            } else {
                const last = history[history.length-1].count;
                const prev = history[history.length-2].count;
                const diff = last - prev;
                let text = (diff > 0 ? '+' : '') + diff;
                currentGrowthEl.innerText = text;
                if (diff > 0) currentGrowthEl.className = 'growth-current positive';
                else if (diff < 0) currentGrowthEl.className = 'growth-current negative';
                else currentGrowthEl.className = 'growth-current zero';
            }
            
            const listHtml = [];
            if (history.length >= 2) {
                const start = Math.max(0, history.length - 6);
                const recentHistory = history.slice(start);
                for (let i = recentHistory.length - 1; i >= 1; i--) {
                    const current = recentHistory[i];
                    const previous = recentHistory[i-1];
                    const diff = current.count - previous.count;
                    const time = current.time;
                    const sign = diff > 0 ? '+' : '';
                    const valueClass = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : 'zero');
                    listHtml.push(`<li><span class="time">${time}</span><span class="value ${valueClass}">${sign}${diff}</span></li>`);
                }
            } else {
                listHtml.push('<li>暂无历史数据</li>');
            }
            historyListEl.innerHTML = listHtml.join('');
        }

        async function fetchData() {
            try {
                const response = await fetch('/api/comment-counts');
                const data = await response.json();
                
                document.getElementById('name1').innerText = data.video1.name;
                document.getElementById('bvid1').innerText = data.video1.bvid;
                document.getElementById('count1').innerText = data.video1.current.toLocaleString();
                
                document.getElementById('name2').innerText = data.video2.name;
                document.getElementById('bvid2').innerText = data.video2.bvid;
                document.getElementById('count2').innerText = data.video2.current.toLocaleString();
                
                updateGrowthPanel(data.video1.history, 
                    document.getElementById('growthCurrent1'), 
                    document.getElementById('growthHistory1'));
                updateGrowthPanel(data.video2.history, 
                    document.getElementById('growthCurrent2'), 
                    document.getElementById('growthHistory2'));
                
                document.getElementById('updateInfo').innerText = `上次更新: ${data.last_update || '--'}`;
                
                // 准备图表数据，取最小长度对齐
                const minLen = Math.min(data.video1.history.length, data.video2.history.length);
                const slicedTimes = data.video1.history.slice(-minLen).map(item => item.time);
                const series1Sliced = data.video1.history.slice(-minLen).map(item => item.count);
                const series2Sliced = data.video2.history.slice(-minLen).map(item => item.count);
                
                myChart.setOption({
                    legend: { data: [data.video1.name, data.video2.name] },
                    xAxis: { data: slicedTimes },
                    series: [
                        { name: data.video1.name, data: series1Sliced },
                        { name: data.video2.name, data: series2Sliced }
                    ]
                });
                
            } catch (error) {
                console.error('获取数据失败:', error);
                document.getElementById('updateInfo').innerText = '获取数据失败，请检查后端服务';
            }
        }
        
        fetchData();
        setInterval(fetchData, {{ UPDATE_INTERVAL * 1000 }});
    </script>
</body>
</html>
'''.replace('{{ UPDATE_INTERVAL }}', str(UPDATE_INTERVAL)).replace('{{ UPDATE_INTERVAL * 1000 }}', str(UPDATE_INTERVAL * 1000))

if __name__ == '__main__':
    print(f"🚀 启动B站双视频评论监控程序（夜间模式）")
    print(f"🎯 监控视频1: {VIDEO_NAME_1} ({VIDEO_BV_1})")
    print(f"🎯 监控视频2: {VIDEO_NAME_2} ({VIDEO_BV_2})")
    print(f"⏱️  更新间隔: {UPDATE_INTERVAL} 秒")
    print("🌐 请访问 http://127.0.0.1:5000 查看实时监控面板")
    app.run(debug=False, host='0.0.0.0', port=5000)