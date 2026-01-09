
import json
import re

def main(csv_string):
    """
    增强版解析逻辑：
    1. 兼容原有的“产品”特定格式。
    2. 新增对通用 CSV/TSV 格式的支持。
    3. 增加容错处理。
    """
    # 0. 基础数据清洗
    if isinstance(csv_string, list):
        csv_string = csv_string[0] if csv_string else ""
    raw_input = str(csv_string).strip()
    
    # 结果容器
    data_points = [] # list of {"name": str, "data": []}
    categories = [] 

    # --- 策略 A: 原始业务逻辑兼容 (基于 "产品" 关键字) ---
    # 仅当文本中显式包含多个"产品"关键字时尝试此逻辑
    if raw_input.count("产品") >= 2:
        try:
            # 清洗特殊符号，模拟原逻辑
            cleaned = re.sub(r'[|\n]', ' ', raw_input).replace('--', ' ').strip()
            parts = re.split(r'(?=产品)', cleaned)
            parts = [p.strip() for p in parts if p.strip()]
            
            if len(parts) > 1:
                # 假设第一部分包含Header (剔除 '产品' 后的部分作为 categories)
                header_parts = parts[0].split()
                # 原逻辑只取 header，这部分比较脆弱，尝试获取后续所有的月份/类别
                if len(header_parts) > 0:
                    temp_categories = header_parts[1:] # 忽略第一个词
                    
                    temp_data = []
                    for p in parts[1:]:
                        cols = p.split()
                        if len(cols) >= 2:
                            name = cols[0]
                            vals = []
                            for x in cols[1:]:
                                try:
                                    # 移除千分位逗号
                                    vals.append(float(x.replace(',', '')))
                                except:
                                    pass
                            if vals:
                                temp_data.append({"name": name, "data": vals})
                    
                    if temp_data:
                        categories = temp_categories
                        data_points = temp_data
        except Exception:
            pass # 策略A失败，静默回退到策略B

    # --- 策略 B: 通用 CSV/表格 解析 (如果策略A未产出数据) ---
    if not data_points:
        try:
            lines = [line.strip() for line in raw_input.split('\n') if line.strip()]
            if len(lines) > 1:
                # 智能推断分隔符: 优先由第一行判断
                first_line = lines[0]
                sep = None
                if '\t' in first_line: sep = '\t'
                elif ',' in first_line: sep = ','
                else: sep = None # 默认后面用正则 splits 空白
                
                # 解析表头
                if sep:
                    header_row = first_line.split(sep)
                else:
                    header_row = re.split(r'\s+', first_line)
                
                # 假设第一列是 Label，后面是 Categories
                categories = [c.strip() for c in header_row[1:] if c.strip()]
                
                # 解析数据行
                for line in lines[1:]:
                    if sep:
                        cols = line.split(sep)
                    else:
                        cols = re.split(r'\s+', line)
                    
                    cols = [c.strip() for c in cols if c.strip()]
                    
                    if len(cols) > 1:
                        name = cols[0]
                        vals = []
                        # 尝试将后续列转为数字，对齐类别长度
                        # 取 min(len(cols)-1, len(categories)) 防止越界，或者补0
                        data_cols = cols[1:]
                        for x in data_cols:
                            try:
                                vals.append(float(x.replace(',', '')))
                            except:
                                vals.append(0.0)
                        
                        data_points.append({"name": name, "data": vals})
        except Exception as e:
            return {"output": f"解析出错: {str(e)}"}

    # --- 结果生成 ---
    if not data_points:
        return {"output": "无法从文档中识别出有效的表格数据。请上传包含表头和数值的标准表格截图或文件。"}
        
    echarts_config = {
        "title": {"text": "数据分析可视化", "left": "center"},
        "tooltip": {"trigger": "axis"},
        "legend": {
            "data": [d['name'] for d in data_points],
            "bottom": 0,
            "type": "scroll" 
        },
        "grid": {"bottom": "15%", "containLabel": True},
        "xAxis": {"type": "category", "data": categories},
        "yAxis": {"type": "value"},
        "series": [
            {
                "name": p['name'],
                "type": "bar", # 可在此处根据数据量改为 'line'
                "data": p['data'],
                "label": {"show": True, "position": "top"} # 增加数值标签
            } for p in data_points
        ]
    }
    
    # 封装为 Markdown
    output = "```echarts\n" + json.dumps(echarts_config, indent=2, ensure_ascii=False) + "\n```"
    return {"output": output}
