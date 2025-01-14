import React, { useState, useEffect } from 'react';
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
  const [step, setStep] = useState(1);  // 当前步骤
  const [dataset, setDataset] = useState(exampleData);
  const [inputText, setInputText] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [classifier] = useState(new NaiveBayes());

  // 添加步骤变化埋点
  useEffect(() => {
    window.dataLayer?.push({
      event: 'zjsr_tab_switch',
      custom_key1: step
    });
  }, [step]);

  // 标注数据
  const handleLabel = (label) => {
    if (!inputText.trim()) return;
    
    // 保留原有标注埋点
    window.dataLayer?.push({
      event: label === '表扬' ? 'zjsr_mark_praise' : 'zjsr_mark_criticize',
      custom_key1: inputText
    });

    setDataset([...dataset, { text: inputText, label }]);
    setInputText("");
    
    // 如果达到6条数据，自动进入下一步
    if (dataset.length >= 5) {
      setTimeout(() => setStep(2), 500);
    }
  };

  // 训练模型
  const handleTrain = () => {
    // 保留原有训练埋点
    window.dataLayer?.push({
      event: 'zjsr_model_train'
    });

    setIsTraining(true);
    
    setTimeout(() => {
      classifier.train(dataset);
      setIsTraining(false);
      setModelTrained(true);
      setStep(3);
    }, 2000);
  };

  // 测试模型
  const handleTest = () => {
    if (!inputText.trim()) return;

    // 保留原有测试埋点
    window.dataLayer?.push({
      event: 'zjsr_test',
      custom_key1: inputText
    });

    const result = classifier.predict(inputText);
    setTestResult(result);

    // 保留原有测试结果埋点
    window.dataLayer?.push({
      event: 'zjsr_test_result',
      custom_key1: inputText,
      custom_key2: result.label,
      custom_key3: result.confidence
    });
  };

  // 添加重置函数
  const handleReset = () => {
    // 重置所有状态
    setStep(1);
    setDataset(exampleData);
    setInputText("");
    setIsTraining(false);
    setModelTrained(false);
    setTestResult(null);
    
    // 添加埋点
    window.dataLayer?.push({
      event: 'zjsr_restart'
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-3 sm:p-6">
        {step === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold">
                1
              </div>
              <h2 className="text-lg sm:text-xl font-bold">先来教我分辨表扬和批评的话～</h2>
            </div>

            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-sm sm:text-base leading-relaxed">
                <span className="inline-block">至少需要标记 6 句话,&nbsp;</span>
                <span className="inline-block">现在已经标记了 {dataset.length} 句</span>
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在这里输入一句话..."
                className="text-base sm:text-lg p-4 sm:p-6"
              />
              
              <div className="flex gap-2 sm:gap-4">
                <Button 
                  onClick={() => handleLabel('表扬')}
                  className="flex-1 h-12 sm:h-16 text-sm sm:text-lg px-2 sm:px-4"
                  variant="outline"
                >
                  这是表扬的话 👍
                </Button>
                <Button 
                  onClick={() => handleLabel('批评')}
                  className="flex-1 h-12 sm:h-16 text-sm sm:text-lg px-2 sm:px-4"
                  variant="outline"
                >
                  这是批评的话 👎
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {dataset.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg text-base sm:text-lg ${
                    item.label === "表扬" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-bold">让我学习一下这些例子～</h2>
            </div>

            <div className="p-6 sm:p-8 bg-blue-50 rounded-lg flex flex-col items-center gap-4">
              {isTraining ? (
                <>
                  <div className="text-xl sm:text-2xl">正在认真学习中...</div>
                  <div className="animate-bounce text-3xl sm:text-4xl">🤔</div>
                </>
              ) : (
                <Button 
                  onClick={handleTrain}
                  className="h-12 sm:h-16 text-base sm:text-lg px-6 sm:px-8"
                >
                  开始学习
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-bold">来测试一下我学得怎么样！</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入一句话，测试我能不能判断对..."
                className="text-base sm:text-lg p-4 sm:p-6"
              />
              
              <Button 
                onClick={handleTest}
                className="w-full h-12 sm:h-16 text-base sm:text-lg"
              >
                测试一下
              </Button>
            </div>

            {testResult && (
              <>
                <div className={`p-6 sm:p-8 rounded-lg text-center space-y-3 sm:space-y-4 ${
                  testResult.label === "表扬" 
                    ? "bg-green-50" 
                    : "bg-red-50"
                }`}>
                  <div className="text-3xl sm:text-4xl">
                    {testResult.label === "表扬" ? "👍" : "👎"}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">
                    我觉得这是
                    <span className={testResult.label === "表扬" ? "text-green-600" : "text-red-600"}>
                      {testResult.label}
                    </span>
                    的话
                  </div>
                  <div className="text-base sm:text-lg">
                    我的把握程度是：{(testResult.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="w-full h-12 sm:h-16 text-base sm:text-lg mt-4"
                >
                  再玩一次 🔄
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextClassifier;