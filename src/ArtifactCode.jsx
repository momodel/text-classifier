import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, Tag, Play, Plus } from 'lucide-react';

// 朴素贝叶斯分类器
class NaiveBayes {
  constructor() {
    // 添加情感词典用于特征增强
    this.sentimentDict = {
      "表扬": new Set([
        // 学习态度
        '认真', '专注', '仔细', '用心', '细心', '耐心', '专心', '努力', '勤奋', '踏实',
        // 学习能力
        '优秀', '聪明', '灵活', '全面', '扎实', '出色', '优异', '突出', '卓越', '杰出',
        // 进步表现
        '进步', '提高', '改进', '成长', '突破', '创新', '超越', '优化', '完善', '提升',
        // 品质评价
        '好', '棒', '强', '佳', '优', '精', '妙', '赞', '绝', '秀',
        // 具体表现
        '领悟快', '思维活跃', '举一反三', '善于思考', '独立思考', '善于总结', '理解深刻',
        '掌握牢固', '融会贯通', '触类旁通', '学以致用', '成绩优异', '表现突出'
      ]),
      "批评": new Set([
        // 学习态度
        '马虎', '粗心', '懒惰', '散漫', '敷衍', '应付', '草率', '大意', '随意', '松懈',
        // 学习状态
        '走神', '分心', '跟不上', '掉队', '落后', '退步', '不专注', '不认真', '不用心', '不上心',
        // 问题表现
        '差', '弱', '糟', '劣', '低', '散', '乱', '错', '偏', '漏',
        // 具体问题
        '理解不够', '掌握不牢', '基础薄弱', '注意力不集中', '学习习惯差', '完成不及时',
        '准备不充分', '态度不端正', '没有进步', '没有改进', '没有提高', '没有长进',
        // 行为描述
        '开小差', '不听讲', '不做作业', '不按时完成', '抄袭作业', '考试作弊'
      ])
    };

    // 保留原有的朴素贝叶斯相关属性
    this.wordFreq = {
      "表扬": new Map(),
      "批评": new Map()
    };
    this.classCounts = {
      "表扬": 0,
      "批评": 0
    };
    this.vocabulary = new Set();
    this.alpha = 1;
  }

  // 改进分词方法
  tokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      let matched = false;
      // 优先匹配词典中的词
      for (let len = 4; len > 0; len--) {
        const word = text.slice(i, i + len);
        if (this.sentimentDict.表扬.has(word) || 
            this.sentimentDict.批评.has(word)) {
          tokens.push(word);
          i += len;
          matched = true;
          break;
        }
      }
      // 如果没有匹配到词典中的词，就按字符分词
      if (!matched) {
        tokens.push(text[i]);
        i++;
      }
    }
    return tokens;
  }

  // 训练模型
  train(dataset) {
    // 重置状态
    this.wordFreq = {
      "表扬": new Map(),
      "批评": new Map()
    };
    this.classCounts = {
      "表扬": 0,
      "批评": 0
    };
    this.vocabulary = new Set();

    // 第一遍扫描：建立词表
    dataset.forEach(item => {
      const tokens = this.tokenize(item.text);
      tokens.forEach(token => this.vocabulary.add(token));
    });

    // 第二遍扫描：统计词频
    dataset.forEach(item => {
      const tokens = this.tokenize(item.text);
      this.classCounts[item.label]++;
      
      tokens.forEach(token => {
        const currentCount = this.wordFreq[item.label].get(token) || 0;
        this.wordFreq[item.label].set(token, currentCount + 1);
      });
    });
  }

  // 计算词语在某个类别中的条件概率
  getWordProb(word, label) {
    const wordCount = this.wordFreq[label].get(word) || 0;
    const totalWords = Array.from(this.wordFreq[label].values()).reduce((a, b) => a + b, 0);
    // 使用拉普拉斯平滑
    return (wordCount + this.alpha) / (totalWords + this.alpha * this.vocabulary.size);
  }

  // 预测新文本
  predict(text) {
    const tokens = this.tokenize(text);
    console.log('分词结果:', tokens);

    // 先检查是否命中词典
    let dictScore = 0;
    let hasNegative = false;

    tokens.forEach(token => {
      // 处理否定词
      if (token === '不' || token === '没' || token === '别' || token === '无') {
        hasNegative = !hasNegative;
        return;
      }

      // 计算词典得分，考虑否定词的影响
      if (this.sentimentDict.表扬.has(token)) {
        dictScore += hasNegative ? -1 : 1;
        hasNegative = false;  // 重置否定标记
      }
      if (this.sentimentDict.批评.has(token)) {
        dictScore += hasNegative ? 1 : -1;
        hasNegative = false;  // 重置否定标记
      }
    });

    // 如果命中词典，直接使用词典结果
    if (dictScore !== 0) {
      console.log('命中词典，得分:', dictScore);
      const confidence = Math.min(Math.abs(dictScore) / 2 + 0.5, 0.95);
      return {
        label: dictScore > 0 ? '表扬' : '批评',
        confidence
      };
    }

    // 否则使用朴素贝叶斯分类
    const total = Object.values(this.classCounts).reduce((a, b) => a + b, 0);
    console.log('未命中词典，使用朴素贝叶斯分类');
    
    // 计算每个类别的概率
    const scores = {};
    Object.keys(this.classCounts).forEach(label => {
      // 类别的先验概率（取对数防止数值下溢）
      let score = Math.log(this.classCounts[label] / total);
      console.log(`${label}类别的先验概率:`, Math.exp(score));  // 查看先验概率
      
      // 累加词语的条件概率
      tokens.forEach(token => {
        if (this.vocabulary.has(token)) {
          const prob = this.getWordProb(token, label);
          score += Math.log(prob);
          console.log(`词语 "${token}" 在 ${label} 类别下的条件概率:`, prob);  // 查看条件概率
        }
      });
      
      scores[label] = score;
    });

    console.log('最终得分:', scores);  // 查看最终得分

    // 找出最高分的类别
    let maxLabel = Object.keys(scores)[0];
    let maxScore = scores[maxLabel];
    Object.entries(scores).forEach(([label, score]) => {
      if (score > maxScore) {
        maxLabel = label;
        maxScore = score;
      }
    });

    // 调整朴素贝叶斯的置信度计算
    const logProbs = Object.values(scores);
    const maxLogProb = Math.max(...logProbs);
    const exps = logProbs.map(p => Math.exp(p - maxLogProb));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    // 基础置信度稍低，因为没有命中词典
    const confidence = Math.min((Math.exp(maxScore - maxLogProb) / sumExp) * 0.8, 0.9);

    console.log('预测结果:', { label: maxLabel, confidence });  // 查看预测结果

    return {
      label: maxLabel,
      confidence
    };
  }

  // 获取特征词权重
  getFeatureWeights() {
    const weights = {
      "表扬": [],
      "批评": []
    };

    // 计算每个词在每个类别中的权重
    this.vocabulary.forEach(word => {
      Object.keys(this.classCounts).forEach(label => {
        // 计算该词在当前类别中的条件概率
        const probInClass = this.getWordProb(word, label);
        
        // 计算该词在其他类别中的条件概率
        const otherLabel = label === "表扬" ? "批评" : "表扬";
        const probInOther = this.getWordProb(word, otherLabel);

        // 计算权重得分 (用两个类别概率的比值)
        const score = probInClass / (probInClass + probInOther);

        // 只有当词频足够时才考虑
        const freq = this.wordFreq[label].get(word) || 0;
        if (freq >= 1) {  // 至少出现过一次
          weights[label].push({ 
            word,
            weight: score,
            // 是否是词典中的词（用于UI展示）
            inDict: this.sentimentDict[label].has(word)
          });
        }
      });
    });

    // 排序并只返回top N个词
    Object.keys(weights).forEach(label => {
      weights[label].sort((a, b) => b.weight - a.weight);
      weights[label] = weights[label].slice(0, 10);
    });

    return weights;
  }
}

// 示例数据
const exampleData = [
  { text: "这次考试考得很好", label: "表扬" },
  { text: "真是太马虎了", label: "批评" },
  { text: "做得非常认真", label: "表扬" },
  { text: "还需要更多练习", label: "批评" },
];

const TextClassifier = () => {
  const [activeTab, setActiveTab] = useState("label");
  const [dataset, setDataset] = useState(exampleData);
  const [labelText, setLabelText] = useState("");
  const [testText, setTestText] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [modelTrained, setModelTrained] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [featureWeights, setFeatureWeights] = useState(null);
  const [classifier] = useState(new NaiveBayes());

  // 添加新数据
  const handleAddData = (label) => {
    if (!labelText.trim()) return;
    setDataset([...dataset, { text: labelText, label }]);
    setLabelText("");
    setModelTrained(false);
  };

  // Tab切换
  const handleTabChange = (tab) => {
    const tabNames = {
      label: '数据标注',
      train: '模型训练',
      test: '模型测试'
    };
    
    window.dataLayer?.push({
      event: 'zjsr_tab_switch',
      custom_key1: tabNames[tab]
    });
    setActiveTab(tab);
  };

  // 标注
  const handleLabel = (type) => {
    if (!labelText.trim()) return;
    
    // 埋点
    window.dataLayer?.push({
      event: type === 'praise' ? 'zjsr_mark_praise' : 'zjsr_mark_criticize',
      custom_key1: labelText
    });

    // 调用原有的标注逻辑
    handleAddData(type === 'praise' ? '表扬' : '批评');
  };

  // 训练模型
  const handleTrain = () => {
    window.dataLayer?.push({
      event: 'zjsr_model_train',
      custom_key1: modelTrained ? '重新训练' : '开始训练'
    });
    setIsTraining(true);
    setTrainProgress(0);
    
    // 模拟训练进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setTrainProgress(progress);
      
      if (progress === 50) {
        // 实际训练模型
        classifier.train(dataset);
        // 获取特征权重
        setFeatureWeights(classifier.getFeatureWeights());
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        setModelTrained(true);
      }
    }, 100);
  };

  // 测试模型
  const handleTest = () => {
    if (!testText.trim()) return;
    
    window.dataLayer?.push({
      event: 'zjsr_test'
    });

    const result = classifier.predict(testText);
    setTestResult(result);

    // 测试结果埋点
    window.dataLayer?.push({
      event: 'zjsr_test_result',
      custom_key1: testText,
      custom_key2: result.label,
      custom_key3: result.confidence
    });
  };

  // 添加删除数据的处理函数
  const handleDeleteData = (index) => {
    const newDataset = [...dataset];
    newDataset.splice(index, 1);
    setDataset(newDataset);
    setModelTrained(false); // 数据变化后需要重新训练
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold">文本分类训练</h2>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600 text-left">
          <h3 className="font-bold mb-2 text-gray-700">使用说明：</h3>
          <ol className="list-decimal ml-4 space-y-1">
            <li>第一步：在"数据标注"页面输入文本并标注为"表扬"或"批评"（至少需要6条数据）</li>
            <li>第二步：切换到"模型训练"页面，点击"开始训练"按钮训练模型</li>
            <li>第三步：在"模型测试"页面输入新的文本进行测试，查看分类结果和置信度</li>
          </ol>
          <div className="mt-2 text-xs text-gray-500">
            提示：数据量越大，模型效果越好。建议每个类别至少标注3条以上的数据。
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4 w-full justify-start gap-2">
            <TabsTrigger 
              value="label" 
              disabled={isTraining} 
              className="flex-1 max-w-[120px] text-sm px-2"
            >
              <Tag className="w-3 h-3 mr-1" />
              数据标注
            </TabsTrigger>
            <TabsTrigger 
              value="train" 
              disabled={isTraining || dataset.length < 6} 
              className="flex-1 max-w-[120px] text-sm px-2"
            >
              <Brain className="w-3 h-3 mr-1" />
              模型训练
            </TabsTrigger>
            <TabsTrigger 
              value="test" 
              disabled={!modelTrained} 
              className="flex-1 max-w-[120px] text-sm px-2"
            >
              <Play className="w-3 h-3 mr-1" />
              模型测试
            </TabsTrigger>
          </TabsList>

          <TabsContent value="label" className="space-y-4">
            <div className="flex flex-col gap-2">
              <Input
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="输入一句话..."
                className="w-full"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleLabel('praise')}
                  variant="outline"
                  className="flex-1"
                >
                  标注为表扬
                </Button>
                <Button 
                  onClick={() => handleLabel('criticize')}
                  variant="outline"
                  className="flex-1"
                >
                  标注为批评
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-4">
                已标注数据 ({dataset.length})
              </h3>
              <div className="space-y-2">
                {dataset.map((item, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="flex-1 text-left">{item.text}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={
                        `px-2 py-1 rounded text-sm shrink-0 ${
                          item.label === "表扬" ? 
                          "bg-green-100 text-green-700" : 
                          "bg-red-100 text-red-700"
                        }`
                      }>
                        {item.label}
                      </span>
                      <button
                        onClick={() => handleDeleteData(index)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                        title="删除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {dataset.length < 6 && (
              <div className="text-sm text-gray-500">
                至少需要6条数据才能开始训练
              </div>
            )}
          </TabsContent>

          <TabsContent value="train" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-4">训练进度</h3>
              {isTraining ? (
                <div className="space-y-2">
                  <Progress value={trainProgress} />
                  <div className="text-sm text-gray-500">
                    正在训练模型... {trainProgress}%
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleTrain}
                  disabled={dataset.length < 6}
                  className="w-full"
                >
                  {modelTrained ? "重新训练" : "开始训练"}
                </Button>
              )}
            </div>

            {featureWeights && (
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-4">特征词分析</h3>
                <div className="text-sm text-gray-500 mb-4">
                  颜色越深表示该词对分类的影响越大
                </div>
                <div className="space-y-6">
                  {Object.entries(featureWeights).map(([label, words]) => (
                    <div key={label} className="space-y-2">
                      <div className="font-medium">
                        {label === "表扬" ? "👍 表扬" : "👎 批评"}类别的关键词：
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {words.map((item, index) => {
                          // 将权重映射到透明度，让差异更明显
                          const opacity = 0.2 + Math.pow(item.weight, 2);
                          
                          // 使用 HSL 颜色以获得更好的对比度
                          const bgColor = label === "表扬" 
                            ? `hsla(142, 76%, 36%, ${opacity})`    // 深绿色
                            : `hsla(0, 84%, 60%, ${opacity})`;     // 深红色
                          
                          // 文字颜色
                          const textColor = opacity > 0.4
                            ? 'white'   
                            : label === "表扬" 
                              ? 'hsl(142, 76%, 25%)'   
                              : 'hsl(0, 84%, 40%)';    

                          return (
                            <div 
                              key={index}
                              className="flex items-center justify-center p-2 rounded text-sm font-medium"
                              style={{ 
                                backgroundColor: bgColor,
                                color: textColor,
                                boxShadow: opacity > 0.5 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {item.word}
                              <span className="ml-1 opacity-50 text-xs">
                                {(item.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="输入测试文本..."
                className="flex-1"
              />
              <Button onClick={handleTest}>
                测试
              </Button>
            </div>

            {testResult && (
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-4">测试结果</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>分类结果：</span>
                    <span className={`font-bold ${
                      testResult.label === "表扬" ? 
                      "text-green-600" : 
                      "text-red-600"
                    }`}>
                      {testResult.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>置信度：</span>
                    <span>{(testResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={testResult.confidence * 100} />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TextClassifier;