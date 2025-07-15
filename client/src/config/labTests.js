// 检验项目配置 - 基于ICD10分类
export const labTestCategories = {
  blood_tests: {
    name: '血液检测',
    icd10: 'D50-D89',
    tests: {
      blood_routine: {
        name: '血常规',
        icd10: 'D50-D53',
        subItems: [
          { name: '白细胞计数', unit: '×10^9/L', normalRange: '3.5-9.5' },
          { name: '中性粒细胞', unit: '%', normalRange: '40-75' },
          { name: '淋巴细胞', unit: '%', normalRange: '20-50' },
          { name: '单核细胞', unit: '%', normalRange: '3-10' },
          { name: '嗜酸性粒细胞', unit: '%', normalRange: '0.5-5' },
          { name: '嗜碱性粒细胞', unit: '%', normalRange: '0-1' },
          { name: '红细胞计数', unit: '×10^12/L', normalRange: '3.5-5.5' },
          { name: '血红蛋白', unit: 'g/L', normalRange: '110-160' },
          { name: '红细胞压积', unit: '%', normalRange: '35-50' },
          { name: '平均红细胞体积', unit: 'fL', normalRange: '80-100' },
          { name: '平均红细胞血红蛋白', unit: 'pg', normalRange: '27-32' },
          { name: '平均红细胞血红蛋白浓度', unit: 'g/L', normalRange: '320-360' },
          { name: '血小板计数', unit: '×10^9/L', normalRange: '100-300' },
          { name: '网织红细胞', unit: '%', normalRange: '0.5-1.5' },
          { name: '红细胞分布宽度', unit: '%', normalRange: '11.5-14.5' },
          { name: '血小板分布宽度', unit: '%', normalRange: '15-17' },
          { name: '平均血小板体积', unit: 'fL', normalRange: '7-11' },
          { name: '大血小板比率', unit: '%', normalRange: '13-43' }
        ]
      },
      cholesterol: {
        name: '胆固醇检测',
        icd10: 'E78',
        subItems: [
          { name: '总胆固醇', unit: 'mmol/L', normalRange: '<5.2' },
          { name: '甘油三酯', unit: 'mmol/L', normalRange: '<1.7' },
          { name: '高密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '>1.0' },
          { name: '低密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '<3.4' },
          { name: '载脂蛋白A1', unit: 'g/L', normalRange: '1.0-1.6' },
          { name: '载脂蛋白B', unit: 'g/L', normalRange: '0.6-1.1' },
          { name: '载脂蛋白E', unit: 'mg/dL', normalRange: '3-7' },
          { name: '脂蛋白(a)', unit: 'mg/dL', normalRange: '<30' },
          { name: '游离脂肪酸', unit: 'mmol/L', normalRange: '0.1-0.6' },
          { name: '磷脂', unit: 'mmol/L', normalRange: '1.5-3.0' },
          { name: '胆固醇酯', unit: 'mmol/L', normalRange: '2.5-4.5' },
          { name: '非高密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '<4.1' }
        ]
      },
      biochemistry: {
        name: '生化检测',
        icd10: 'E70-E90',
        subItems: [
          { name: '血糖', unit: 'mmol/L', normalRange: '3.9-6.1' },
          { name: '尿素氮', unit: 'mmol/L', normalRange: '2.9-8.2' },
          { name: '肌酐', unit: 'μmol/L', normalRange: '44-133' },
          { name: '尿酸', unit: 'μmol/L', normalRange: '150-420' },
          { name: '总蛋白', unit: 'g/L', normalRange: '60-80' },
          { name: '白蛋白', unit: 'g/L', normalRange: '35-55' },
          { name: '球蛋白', unit: 'g/L', normalRange: '20-35' },
          { name: '丙氨酸氨基转移酶', unit: 'U/L', normalRange: '7-40' },
          { name: '天门冬氨酸氨基转移酶', unit: 'U/L', normalRange: '13-35' },
          { name: '碱性磷酸酶', unit: 'U/L', normalRange: '40-150' },
          { name: 'γ-谷氨酰转移酶', unit: 'U/L', normalRange: '7-45' },
          { name: '总胆红素', unit: 'μmol/L', normalRange: '3.4-17.1' },
          { name: '直接胆红素', unit: 'μmol/L', normalRange: '0-6.8' },
          { name: '间接胆红素', unit: 'μmol/L', normalRange: '3.4-13.7' },
          { name: '钠', unit: 'mmol/L', normalRange: '135-145' },
          { name: '钾', unit: 'mmol/L', normalRange: '3.5-5.5' },
          { name: '氯', unit: 'mmol/L', normalRange: '96-106' },
          { name: '二氧化碳结合力', unit: 'mmol/L', normalRange: '22-29' },
          { name: '钙', unit: 'mmol/L', normalRange: '2.1-2.7' },
          { name: '磷', unit: 'mmol/L', normalRange: '0.8-1.6' },
          { name: '镁', unit: 'mmol/L', normalRange: '0.7-1.1' },
          { name: '乳酸脱氢酶', unit: 'U/L', normalRange: '120-250' },
          { name: '肌酸激酶', unit: 'U/L', normalRange: '26-140' },
          { name: '肌酸激酶同工酶', unit: 'U/L', normalRange: '0-25' },
          { name: '淀粉酶', unit: 'U/L', normalRange: '30-110' },
          { name: '脂肪酶', unit: 'U/L', normalRange: '13-60' },
          { name: '胆碱酯酶', unit: 'U/L', normalRange: '4300-13200' },
          { name: '总胆汁酸', unit: 'μmol/L', normalRange: '0-10' },
          { name: '前白蛋白', unit: 'mg/L', normalRange: '200-400' },
          { name: '转铁蛋白', unit: 'g/L', normalRange: '2.0-3.6' },
          { name: '铁', unit: 'μmol/L', normalRange: '9-30' },
          { name: '总铁结合力', unit: 'μmol/L', normalRange: '45-77' },
          { name: '铁蛋白', unit: 'μg/L', normalRange: '15-200' },
          { name: '维生素B12', unit: 'pmol/L', normalRange: '133-675' },
          { name: '叶酸', unit: 'nmol/L', normalRange: '7-45' }
        ]
      },
      thyroid_function: {
        name: '甲状腺功能',
        icd10: 'E00-E07',
        subItems: [
          { name: '促甲状腺激素', unit: 'mIU/L', normalRange: '0.27-4.2' },
          { name: '游离三碘甲状腺原氨酸', unit: 'pmol/L', normalRange: '3.1-6.8' },
          { name: '游离甲状腺素', unit: 'pmol/L', normalRange: '12-22' },
          { name: '总三碘甲状腺原氨酸', unit: 'nmol/L', normalRange: '1.3-3.1' },
          { name: '总甲状腺素', unit: 'nmol/L', normalRange: '66-181' },
          { name: '甲状腺球蛋白', unit: 'μg/L', normalRange: '3.5-77' },
          { name: '抗甲状腺过氧化物酶抗体', unit: 'IU/mL', normalRange: '<34' },
          { name: '抗甲状腺球蛋白抗体', unit: 'IU/mL', normalRange: '<115' },
          { name: '甲状腺刺激免疫球蛋白', unit: 'IU/L', normalRange: '<1.75' },
          { name: '反三碘甲状腺原氨酸', unit: 'ng/dL', normalRange: '10-24' }
        ]
      },
      endocrine_function: {
        name: '内分泌功能',
        icd10: 'E20-E35',
        subItems: [
          { name: '促肾上腺皮质激素', unit: 'pg/mL', normalRange: '7.2-63.3' },
          { name: '皮质醇', unit: 'μg/dL', normalRange: '6.2-19.4' },
          { name: '醛固酮', unit: 'ng/dL', normalRange: '3-35' },
          { name: '肾素活性', unit: 'ng/mL/h', normalRange: '0.2-2.8' },
          { name: '血管紧张素II', unit: 'pg/mL', normalRange: '25-144' },
          { name: '生长激素', unit: 'ng/mL', normalRange: '<5' },
          { name: '胰岛素样生长因子-1', unit: 'ng/mL', normalRange: '117-329' },
          { name: '促卵泡激素', unit: 'mIU/mL', normalRange: '1.5-12.4' },
          { name: '促黄体生成素', unit: 'mIU/mL', normalRange: '1.7-8.6' },
          { name: '雌二醇', unit: 'pg/mL', normalRange: '12.5-166' },
          { name: '孕酮', unit: 'ng/mL', normalRange: '0.1-0.8' },
          { name: '睾酮', unit: 'ng/dL', normalRange: '300-1000' },
          { name: '催乳素', unit: 'ng/mL', normalRange: '4.8-23.3' },
          { name: '抗利尿激素', unit: 'pg/mL', normalRange: '1-13' },
          { name: '降钙素', unit: 'pg/mL', normalRange: '<10' },
          { name: '甲状旁腺激素', unit: 'pg/mL', normalRange: '15-65' },
          { name: '1,25-二羟维生素D3', unit: 'pg/mL', normalRange: '20-60' },
          { name: '25-羟维生素D', unit: 'ng/mL', normalRange: '30-100' }
        ]
      },
      diabetes_related: {
        name: '糖尿病相关',
        icd10: 'E10-E14',
        subItems: [
          { name: '空腹血糖', unit: 'mmol/L', normalRange: '3.9-6.1' },
          { name: '餐后2小时血糖', unit: 'mmol/L', normalRange: '<7.8' },
          { name: '糖化血红蛋白', unit: '%', normalRange: '4.0-6.0' },
          { name: '糖化白蛋白', unit: '%', normalRange: '11-16' },
          { name: '胰岛素', unit: 'μIU/mL', normalRange: '3-25' },
          { name: 'C肽', unit: 'ng/mL', normalRange: '0.8-4.0' },
          { name: '胰岛素抗体', unit: 'U/mL', normalRange: '<5' },
          { name: '谷氨酸脱羧酶抗体', unit: 'U/mL', normalRange: '<5' },
          { name: '胰岛细胞抗体', unit: '', normalRange: '阴性' },
          { name: '酮体', unit: 'mmol/L', normalRange: '<0.6' },
          { name: '乳酸', unit: 'mmol/L', normalRange: '0.5-2.2' },
          { name: 'β-羟丁酸', unit: 'mmol/L', normalRange: '<0.3' }
        ]
      },
      lipid_metabolism: {
        name: '脂质代谢',
        icd10: 'E78',
        subItems: [
          { name: '总胆固醇', unit: 'mmol/L', normalRange: '<5.2' },
          { name: '甘油三酯', unit: 'mmol/L', normalRange: '<1.7' },
          { name: '高密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '>1.0' },
          { name: '低密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '<3.4' },
          { name: '载脂蛋白A1', unit: 'g/L', normalRange: '1.0-1.6' },
          { name: '载脂蛋白B', unit: 'g/L', normalRange: '0.6-1.1' },
          { name: '载脂蛋白E', unit: 'mg/dL', normalRange: '3-7' },
          { name: '脂蛋白(a)', unit: 'mg/dL', normalRange: '<30' },
          { name: '游离脂肪酸', unit: 'mmol/L', normalRange: '0.1-0.6' },
          { name: '磷脂', unit: 'mmol/L', normalRange: '1.5-3.0' },
          { name: '胆固醇酯', unit: 'mmol/L', normalRange: '2.5-4.5' },
          { name: '非高密度脂蛋白胆固醇', unit: 'mmol/L', normalRange: '<4.1' }
        ]
      },
      cardiovascular_markers: {
        name: '心血管标志物',
        icd10: 'I00-I99',
        subItems: [
          { name: '肌钙蛋白I', unit: 'ng/mL', normalRange: '<0.04' },
          { name: '肌钙蛋白T', unit: 'ng/mL', normalRange: '<0.01' },
          { name: '肌红蛋白', unit: 'ng/mL', normalRange: '<90' },
          { name: '脑钠肽', unit: 'pg/mL', normalRange: '<100' },
          { name: 'N端脑钠肽前体', unit: 'pg/mL', normalRange: '<125' },
          { name: '同型半胱氨酸', unit: 'μmol/L', normalRange: '5-15' },
          { name: '高敏C反应蛋白', unit: 'mg/L', normalRange: '<3' },
          { name: '脂蛋白相关磷脂酶A2', unit: 'ng/mL', normalRange: '<200' },
          { name: '髓过氧化物酶', unit: 'pmol/L', normalRange: '<640' },
          { name: '妊娠相关血浆蛋白A', unit: 'mIU/L', normalRange: '0.5-2.0' },
          { name: '可溶性CD40配体', unit: 'ng/mL', normalRange: '<5' },
          { name: '纤维蛋白原', unit: 'g/L', normalRange: '2-4' },
          { name: 'D-二聚体', unit: 'μg/L', normalRange: '<0.5' },
          { name: '血管性血友病因子', unit: '%', normalRange: '50-150' }
        ]
      },
      kidney_function: {
        name: '肾脏功能',
        icd10: 'N17-N19',
        subItems: [
          { name: '尿素氮', unit: 'mmol/L', normalRange: '2.9-8.2' },
          { name: '肌酐', unit: 'μmol/L', normalRange: '44-133' },
          { name: '尿酸', unit: 'μmol/L', normalRange: '150-420' },
          { name: '胱抑素C', unit: 'mg/L', normalRange: '0.53-0.95' },
          { name: 'β2-微球蛋白', unit: 'mg/L', normalRange: '1.0-3.0' },
          { name: '视黄醇结合蛋白', unit: 'mg/L', normalRange: '30-60' },
          { name: '中性粒细胞明胶酶相关脂质运载蛋白', unit: 'ng/mL', normalRange: '<150' },
          { name: '肾损伤分子-1', unit: 'ng/mL', normalRange: '<2.0' },
          { name: '白蛋白', unit: 'g/L', normalRange: '35-55' },
          { name: '总蛋白', unit: 'g/L', normalRange: '60-80' },
          { name: '钠', unit: 'mmol/L', normalRange: '135-145' },
          { name: '钾', unit: 'mmol/L', normalRange: '3.5-5.5' },
          { name: '氯', unit: 'mmol/L', normalRange: '96-106' },
          { name: '钙', unit: 'mmol/L', normalRange: '2.1-2.7' },
          { name: '磷', unit: 'mmol/L', normalRange: '0.8-1.6' },
          { name: '镁', unit: 'mmol/L', normalRange: '0.7-1.1' },
          { name: '碳酸氢盐', unit: 'mmol/L', normalRange: '22-29' },
          { name: '阴离子间隙', unit: 'mmol/L', normalRange: '8-16' }
        ]
      },
      liver_function: {
        name: '肝脏功能',
        icd10: 'K70-K77',
        subItems: [
          { name: '丙氨酸氨基转移酶', unit: 'U/L', normalRange: '7-40' },
          { name: '天门冬氨酸氨基转移酶', unit: 'U/L', normalRange: '13-35' },
          { name: '碱性磷酸酶', unit: 'U/L', normalRange: '40-150' },
          { name: 'γ-谷氨酰转移酶', unit: 'U/L', normalRange: '7-45' },
          { name: '总胆红素', unit: 'μmol/L', normalRange: '3.4-17.1' },
          { name: '直接胆红素', unit: 'μmol/L', normalRange: '0-6.8' },
          { name: '间接胆红素', unit: 'μmol/L', normalRange: '3.4-13.7' },
          { name: '总蛋白', unit: 'g/L', normalRange: '60-80' },
          { name: '白蛋白', unit: 'g/L', normalRange: '35-55' },
          { name: '球蛋白', unit: 'g/L', normalRange: '20-35' },
          { name: '前白蛋白', unit: 'mg/L', normalRange: '200-400' },
          { name: '胆碱酯酶', unit: 'U/L', normalRange: '4300-13200' },
          { name: '总胆汁酸', unit: 'μmol/L', normalRange: '0-10' },
          { name: '5-核苷酸酶', unit: 'U/L', normalRange: '0-17' },
          { name: '亮氨酸氨基肽酶', unit: 'U/L', normalRange: '15-40' },
          { name: '乳酸脱氢酶', unit: 'U/L', normalRange: '120-250' },
          { name: 'α-胎蛋白', unit: 'μg/L', normalRange: '<20' },
          { name: '铁', unit: 'μmol/L', normalRange: '9-30' },
          { name: '铁蛋白', unit: 'μg/L', normalRange: '15-200' },
          { name: '转铁蛋白', unit: 'g/L', normalRange: '2.0-3.6' },
          { name: '铜', unit: 'μmol/L', normalRange: '11-22' },
          { name: '铜蓝蛋白', unit: 'mg/L', normalRange: '200-600' }
        ]
      },
      bone_metabolism: {
        name: '骨骼代谢',
        icd10: 'M80-M85',
        subItems: [
          { name: '钙', unit: 'mmol/L', normalRange: '2.1-2.7' },
          { name: '磷', unit: 'mmol/L', normalRange: '0.8-1.6' },
          { name: '镁', unit: 'mmol/L', normalRange: '0.7-1.1' },
          { name: '碱性磷酸酶', unit: 'U/L', normalRange: '40-150' },
          { name: '甲状旁腺激素', unit: 'pg/mL', normalRange: '15-65' },
          { name: '25-羟维生素D', unit: 'ng/mL', normalRange: '30-100' },
          { name: '1,25-二羟维生素D3', unit: 'pg/mL', normalRange: '20-60' },
          { name: '降钙素', unit: 'pg/mL', normalRange: '<10' },
          { name: '骨钙素', unit: 'ng/mL', normalRange: '11-43' },
          { name: 'I型胶原羧基端肽', unit: 'μg/L', normalRange: '0.1-0.6' },
          { name: 'I型胶原氨基端肽', unit: 'μg/L', normalRange: '10-65' },
          { name: 'β-胶原降解产物', unit: 'μg/L', normalRange: '0.1-0.6' },
          { name: '骨特异性碱性磷酸酶', unit: 'μg/L', normalRange: '7-20' },
          { name: '抗酒石酸酸性磷酸酶', unit: 'U/L', normalRange: '1.5-4.5' },
          { name: '骨保护素', unit: 'pmol/L', normalRange: '1.5-4.5' },
          { name: '核因子κB受体活化因子配体', unit: 'pmol/L', normalRange: '0.1-0.6' }
        ]
      },
      immune_function: {
        name: '免疫功能',
        icd10: 'D80-D89',
        subItems: [
          { name: '免疫球蛋白G', unit: 'g/L', normalRange: '7.0-16.0' },
          { name: '免疫球蛋白A', unit: 'g/L', normalRange: '0.7-4.0' },
          { name: '免疫球蛋白M', unit: 'g/L', normalRange: '0.4-2.3' },
          { name: '免疫球蛋白E', unit: 'IU/mL', normalRange: '<100' },
          { name: '免疫球蛋白D', unit: 'mg/L', normalRange: '0-100' },
          { name: '补体C3', unit: 'g/L', normalRange: '0.9-1.8' },
          { name: '补体C4', unit: 'g/L', normalRange: '0.1-0.4' },
          { name: '总补体活性', unit: 'U/mL', normalRange: '50-100' },
          { name: 'C反应蛋白', unit: 'mg/L', normalRange: '<3' },
          { name: '类风湿因子', unit: 'IU/mL', normalRange: '<20' },
          { name: '抗核抗体', unit: '', normalRange: '阴性' },
          { name: '抗双链DNA抗体', unit: 'IU/mL', normalRange: '<30' },
          { name: '抗Sm抗体', unit: '', normalRange: '阴性' },
          { name: '抗SSA抗体', unit: '', normalRange: '阴性' },
          { name: '抗SSB抗体', unit: '', normalRange: '阴性' },
          { name: '抗RNP抗体', unit: '', normalRange: '阴性' },
          { name: '抗Scl-70抗体', unit: '', normalRange: '阴性' },
          { name: '抗Jo-1抗体', unit: '', normalRange: '阴性' },
          { name: '抗着丝点抗体', unit: '', normalRange: '阴性' },
          { name: '抗中性粒细胞胞浆抗体', unit: '', normalRange: '阴性' },
          { name: '抗心磷脂抗体', unit: 'GPL', normalRange: '<12' },
          { name: '抗β2糖蛋白I抗体', unit: 'U/mL', normalRange: '<20' },
          { name: '狼疮抗凝物', unit: '', normalRange: '阴性' },
          { name: '循环免疫复合物', unit: 'μg/mL', normalRange: '<50' },
          { name: '冷球蛋白', unit: 'mg/L', normalRange: '<80' }
        ]
      },
      infection_markers: {
        name: '感染标志物',
        icd10: 'A00-B99',
        subItems: [
          { name: 'C反应蛋白', unit: 'mg/L', normalRange: '<3' },
          { name: '降钙素原', unit: 'ng/mL', normalRange: '<0.05' },
          { name: '白细胞计数', unit: '×10^9/L', normalRange: '3.5-9.5' },
          { name: '中性粒细胞', unit: '%', normalRange: '40-75' },
          { name: '淋巴细胞', unit: '%', normalRange: '20-50' },
          { name: '单核细胞', unit: '%', normalRange: '3-10' },
          { name: '嗜酸性粒细胞', unit: '%', normalRange: '0.5-5' },
          { name: '嗜碱性粒细胞', unit: '%', normalRange: '0-1' },
          { name: '红细胞沉降率', unit: 'mm/h', normalRange: '<20' },
          { name: '血清淀粉样蛋白A', unit: 'mg/L', normalRange: '<10' },
          { name: '铁蛋白', unit: 'μg/L', normalRange: '15-200' },
          { name: '转铁蛋白', unit: 'g/L', normalRange: '2.0-3.6' },
          { name: '血清铁', unit: 'μmol/L', normalRange: '9-30' },
          { name: '总铁结合力', unit: 'μmol/L', normalRange: '45-77' },
          { name: '转铁蛋白饱和度', unit: '%', normalRange: '20-50' },
          { name: '可溶性转铁蛋白受体', unit: 'mg/L', normalRange: '1.9-4.4' },
          { name: '白细胞介素-6', unit: 'pg/mL', normalRange: '<7' },
          { name: '肿瘤坏死因子-α', unit: 'pg/mL', normalRange: '<8.1' },
          { name: '干扰素-γ', unit: 'pg/mL', normalRange: '<2' },
          { name: '白细胞介素-1β', unit: 'pg/mL', normalRange: '<5' },
          { name: '白细胞介素-8', unit: 'pg/mL', normalRange: '<62' },
          { name: '白细胞介素-10', unit: 'pg/mL', normalRange: '<9.1' }
        ]
      },
      coagulation: {
        name: '凝血功能',
        icd10: 'D65-D69',
        subItems: [
          { name: '凝血酶原时间', unit: '秒', normalRange: '11-14' },
          { name: '活化部分凝血活酶时间', unit: '秒', normalRange: '25-35' },
          { name: '纤维蛋白原', unit: 'g/L', normalRange: '2-4' },
          { name: '凝血酶时间', unit: '秒', normalRange: '14-21' },
          { name: 'D-二聚体', unit: 'μg/L', normalRange: '<0.5' },
          { name: '抗凝血酶III', unit: '%', normalRange: '80-120' },
          { name: '蛋白C', unit: '%', normalRange: '70-140' },
          { name: '蛋白S', unit: '%', normalRange: '60-130' },
          { name: '活化蛋白C抵抗', unit: '比值', normalRange: '>2.0' },
          { name: '凝血因子VIII', unit: '%', normalRange: '50-150' },
          { name: '凝血因子IX', unit: '%', normalRange: '50-150' },
          { name: '凝血因子XI', unit: '%', normalRange: '50-150' },
          { name: '凝血因子XII', unit: '%', normalRange: '50-150' },
          { name: '血管性血友病因子', unit: '%', normalRange: '50-150' },
          { name: '血小板聚集试验', unit: '%', normalRange: '60-90' },
          { name: '血小板功能分析', unit: '秒', normalRange: '95-165' },
          { name: '血栓弹力图', unit: '', normalRange: '正常' },
          { name: '纤维蛋白降解产物', unit: 'mg/L', normalRange: '<5' },
          { name: '纤溶酶原', unit: '%', normalRange: '80-120' },
          { name: 'α2-抗纤溶酶', unit: '%', normalRange: '80-120' },
          { name: '组织型纤溶酶原激活物', unit: 'ng/mL', normalRange: '1-12' },
          { name: '纤溶酶原激活物抑制剂-1', unit: 'ng/mL', normalRange: '4-43' }
        ]
      },
      tumor_markers: {
        name: '肿瘤标志物',
        icd10: 'C00-D48',
        subItems: [
          { name: '甲胎蛋白', unit: 'μg/L', normalRange: '<20' },
          { name: '癌胚抗原', unit: 'μg/L', normalRange: '<5' },
          { name: '糖类抗原125', unit: 'U/mL', normalRange: '<35' },
          { name: '糖类抗原199', unit: 'U/mL', normalRange: '<37' },
          { name: '糖类抗原153', unit: 'U/mL', normalRange: '<25' },
          { name: '糖类抗原724', unit: 'U/mL', normalRange: '<6.9' },
          { name: '糖类抗原242', unit: 'U/mL', normalRange: '<20' },
          { name: '糖类抗原50', unit: 'U/mL', normalRange: '<25' },
          { name: '前列腺特异性抗原', unit: 'μg/L', normalRange: '<4' },
          { name: '游离前列腺特异性抗原', unit: 'μg/L', normalRange: '<0.93' },
          { name: '神经元特异性烯醇化酶', unit: 'μg/L', normalRange: '<16.3' },
          { name: '细胞角蛋白19片段', unit: 'μg/L', normalRange: '<3.3' },
          { name: '鳞状细胞癌抗原', unit: 'μg/L', normalRange: '<1.5' },
          { name: '人绒毛膜促性腺激素', unit: 'mIU/mL', normalRange: '<5' },
          { name: 'β-人绒毛膜促性腺激素', unit: 'mIU/mL', normalRange: '<5' },
          { name: 'α-胎蛋白', unit: 'μg/L', normalRange: '<20' },
          { name: '铁蛋白', unit: 'μg/L', normalRange: '15-200' },
          { name: 'β2-微球蛋白', unit: 'mg/L', normalRange: '1.0-3.0' },
          { name: '乳酸脱氢酶', unit: 'U/L', normalRange: '120-250' },
          { name: '碱性磷酸酶', unit: 'U/L', normalRange: '40-150' },
          { name: 'γ-谷氨酰转移酶', unit: 'U/L', normalRange: '7-45' },
          { name: '5-核苷酸酶', unit: 'U/L', normalRange: '0-17' },
          { name: '亮氨酸氨基肽酶', unit: 'U/L', normalRange: '15-40' },
          { name: 'α-L-岩藻糖苷酶', unit: 'U/L', normalRange: '5-40' },
          { name: '甘氨酰脯氨酸二肽氨基肽酶', unit: 'U/L', normalRange: '44-116' },
          { name: 'γ-谷氨酰转移酶同工酶', unit: 'U/L', normalRange: '0-4' },
          { name: '醛缩酶', unit: 'U/L', normalRange: '1.5-6.5' },
          { name: '肌酸激酶同工酶', unit: 'U/L', normalRange: '0-25' },
          { name: '乳酸脱氢酶同工酶', unit: 'U/L', normalRange: '正常' },
          { name: '碱性磷酸酶同工酶', unit: 'U/L', normalRange: '正常' }
        ]
      },
      allergy_tests: {
        name: '过敏检测',
        icd10: 'T78.4',
        subItems: [
          { name: '总免疫球蛋白E', unit: 'IU/mL', normalRange: '<100' },
          { name: '特异性免疫球蛋白E', unit: 'kU/L', normalRange: '<0.35' },
          { name: '嗜酸性粒细胞', unit: '%', normalRange: '0.5-5' },
          { name: '嗜碱性粒细胞', unit: '%', normalRange: '0-1' },
          { name: '组胺', unit: 'ng/mL', normalRange: '<1' },
          { name: '类胰蛋白酶', unit: 'μg/L', normalRange: '<11.4' },
          { name: '白三烯E4', unit: 'ng/mL', normalRange: '<100' },
          { name: '前列腺素D2', unit: 'pg/mL', normalRange: '<200' },
          { name: '血小板活化因子', unit: 'ng/mL', normalRange: '<2' },
          { name: '补体C3a', unit: 'ng/mL', normalRange: '<200' },
          { name: '补体C4a', unit: 'ng/mL', normalRange: '<200' },
          { name: '补体C5a', unit: 'ng/mL', normalRange: '<10' },
          { name: '白细胞介素-4', unit: 'pg/mL', normalRange: '<5' },
          { name: '白细胞介素-5', unit: 'pg/mL', normalRange: '<5' },
          { name: '白细胞介素-13', unit: 'pg/mL', normalRange: '<5' },
          { name: '干扰素-γ', unit: 'pg/mL', normalRange: '<2' },
          { name: '肿瘤坏死因子-α', unit: 'pg/mL', normalRange: '<8.1' },
          { name: '转化生长因子-β', unit: 'pg/mL', normalRange: '<1000' }
        ]
      },
      drug_monitoring: {
        name: '药物监测',
        icd10: 'T36-T65',
        subItems: [
          { name: '地高辛', unit: 'ng/mL', normalRange: '0.8-2.0' },
          { name: '卡马西平', unit: 'μg/mL', normalRange: '4-12' },
          { name: '苯妥英钠', unit: 'μg/mL', normalRange: '10-20' },
          { name: '丙戊酸钠', unit: 'μg/mL', normalRange: '50-100' },
          { name: '苯巴比妥', unit: 'μg/mL', normalRange: '15-40' },
          { name: '拉莫三嗪', unit: 'μg/mL', normalRange: '3-14' },
          { name: '左乙拉西坦', unit: 'μg/mL', normalRange: '12-46' },
          { name: '托吡酯', unit: 'μg/mL', normalRange: '5-20' },
          { name: '锂盐', unit: 'mmol/L', normalRange: '0.6-1.2' },
          { name: '环孢素', unit: 'ng/mL', normalRange: '100-400' },
          { name: '他克莫司', unit: 'ng/mL', normalRange: '5-15' },
          { name: '西罗莫司', unit: 'ng/mL', normalRange: '3-15' },
          { name: '霉酚酸', unit: 'μg/mL', normalRange: '1-3.5' },
          { name: '甲氨蝶呤', unit: 'μmol/L', normalRange: '<0.1' },
          { name: '万古霉素', unit: 'μg/mL', normalRange: '10-20' },
          { name: '庆大霉素', unit: 'μg/mL', normalRange: '5-10' },
          { name: '妥布霉素', unit: 'μg/mL', normalRange: '5-10' },
          { name: '阿米卡星', unit: 'μg/mL', normalRange: '15-25' },
          { name: '茶碱', unit: 'μg/mL', normalRange: '10-20' },
          { name: '华法林', unit: 'INR', normalRange: '2.0-3.0' },
          { name: '肝素', unit: 'U/mL', normalRange: '0.3-0.7' },
          { name: '低分子肝素', unit: 'U/mL', normalRange: '0.5-1.0' }
        ]
      }
    }
  },
  body_fluid_tests: {
    name: '体液检测',
    icd10: 'N00-N99',
    tests: {
      urine_routine: {
        name: '尿常规',
        icd10: 'N30-N39',
        subItems: [
          { name: '尿颜色', unit: '', normalRange: '淡黄色' },
          { name: '尿透明度', unit: '', normalRange: '透明' },
          { name: '尿比重', unit: '', normalRange: '1.010-1.025' },
          { name: '尿pH值', unit: '', normalRange: '5.5-7.5' },
          { name: '尿蛋白', unit: 'mg/L', normalRange: '<150' },
          { name: '尿糖', unit: 'mmol/L', normalRange: '<2.8' },
          { name: '尿酮体', unit: '', normalRange: '阴性' },
          { name: '尿胆红素', unit: '', normalRange: '阴性' },
          { name: '尿胆原', unit: '', normalRange: '阴性' },
          { name: '尿潜血', unit: '', normalRange: '阴性' },
          { name: '尿亚硝酸盐', unit: '', normalRange: '阴性' },
          { name: '尿白细胞酯酶', unit: '', normalRange: '阴性' },
          { name: '尿白细胞', unit: '个/HP', normalRange: '<5' },
          { name: '尿红细胞', unit: '个/HP', normalRange: '<3' },
          { name: '尿上皮细胞', unit: '个/HP', normalRange: '<5' },
          { name: '尿管型', unit: '个/HP', normalRange: '0' },
          { name: '尿结晶', unit: '', normalRange: '阴性' },
          { name: '尿细菌', unit: '个/HP', normalRange: '0' },
          { name: '尿真菌', unit: '', normalRange: '阴性' },
          { name: '尿寄生虫', unit: '', normalRange: '阴性' }
        ]
      },
      urine_culture: {
        name: '尿培养',
        icd10: 'N30-N39',
        subItems: [
          { name: '尿细菌培养', unit: 'CFU/mL', normalRange: '<10^5' },
          { name: '尿真菌培养', unit: 'CFU/mL', normalRange: '阴性' },
          { name: '尿支原体培养', unit: '', normalRange: '阴性' },
          { name: '尿衣原体检测', unit: '', normalRange: '阴性' },
          { name: '尿结核杆菌培养', unit: '', normalRange: '阴性' },
          { name: '尿药敏试验', unit: '', normalRange: '敏感' }
        ]
      },
      urine_biochemistry: {
        name: '尿生化',
        icd10: 'N30-N39',
        subItems: [
          { name: '尿肌酐', unit: 'mmol/L', normalRange: '8.8-17.6' },
          { name: '尿尿素氮', unit: 'mmol/L', normalRange: '250-600' },
          { name: '尿尿酸', unit: 'mmol/L', normalRange: '1.5-4.5' },
          { name: '尿钠', unit: 'mmol/L', normalRange: '40-220' },
          { name: '尿钾', unit: 'mmol/L', normalRange: '25-100' },
          { name: '尿氯', unit: 'mmol/L', normalRange: '110-250' },
          { name: '尿钙', unit: 'mmol/L', normalRange: '2.5-7.5' },
          { name: '尿磷', unit: 'mmol/L', normalRange: '12.9-42.0' },
          { name: '尿镁', unit: 'mmol/L', normalRange: '3.0-5.0' },
          { name: '尿微量白蛋白', unit: 'mg/L', normalRange: '<30' },
          { name: '尿转铁蛋白', unit: 'mg/L', normalRange: '<2.0' },
          { name: '尿免疫球蛋白G', unit: 'mg/L', normalRange: '<10' },
          { name: '尿α1-微球蛋白', unit: 'mg/L', normalRange: '<12' },
          { name: '尿β2-微球蛋白', unit: 'mg/L', normalRange: '<0.3' },
          { name: '尿视黄醇结合蛋白', unit: 'mg/L', normalRange: '<0.5' },
          { name: '尿N-乙酰-β-D-氨基葡萄糖苷酶', unit: 'U/L', normalRange: '<16' },
          { name: '尿γ-谷氨酰转移酶', unit: 'U/L', normalRange: '<50' },
          { name: '尿碱性磷酸酶', unit: 'U/L', normalRange: '<20' },
          { name: '尿乳酸脱氢酶', unit: 'U/L', normalRange: '<50' }
        ]
      },
      urine_hormone: {
        name: '尿激素',
        icd10: 'N30-N39',
        subItems: [
          { name: '尿17-羟皮质类固醇', unit: 'μmol/24h', normalRange: '5.5-28.0' },
          { name: '尿17-酮类固醇', unit: 'μmol/24h', normalRange: '17-80' },
          { name: '尿游离皮质醇', unit: 'nmol/24h', normalRange: '55-248' },
          { name: '尿醛固酮', unit: 'nmol/24h', normalRange: '2.8-27.7' },
          { name: '尿儿茶酚胺', unit: 'μmol/24h', normalRange: '<1.65' },
          { name: '尿香草扁桃酸', unit: 'μmol/24h', normalRange: '10-35' },
          { name: '尿高香草酸', unit: 'μmol/24h', normalRange: '15-40' },
          { name: '尿5-羟吲哚乙酸', unit: 'μmol/24h', normalRange: '10-47' },
          { name: '尿雌二醇', unit: 'nmol/24h', normalRange: '5-100' },
          { name: '尿孕酮', unit: 'nmol/24h', normalRange: '3-35' },
          { name: '尿睾酮', unit: 'nmol/24h', normalRange: '100-800' },
          { name: '尿人绒毛膜促性腺激素', unit: 'IU/L', normalRange: '<5' }
        ]
      },
      urine_tumor_markers: {
        name: '尿肿瘤标志物',
        icd10: 'N30-N39',
        subItems: [
          { name: '尿膀胱肿瘤抗原', unit: 'U/mL', normalRange: '<14' },
          { name: '尿核基质蛋白22', unit: 'U/mL', normalRange: '<10' },
          { name: '尿纤维连接蛋白', unit: 'μg/mL', normalRange: '<0.3' },
          { name: '尿透明质酸', unit: 'ng/mL', normalRange: '<100' },
          { name: '尿细胞角蛋白19片段', unit: 'ng/mL', normalRange: '<3.3' },
          { name: '尿端粒酶', unit: '', normalRange: '阴性' }
        ]
      },
      urine_24h: {
        name: '24小时尿',
        icd10: 'N30-N39',
        subItems: [
          { name: '24小时尿量', unit: 'mL', normalRange: '1000-2000' },
          { name: '24小时尿蛋白定量', unit: 'mg/24h', normalRange: '<150' },
          { name: '24小时尿糖定量', unit: 'mmol/24h', normalRange: '<2.8' },
          { name: '24小时尿肌酐清除率', unit: 'mL/min', normalRange: '80-120' },
          { name: '24小时尿钠排泄', unit: 'mmol/24h', normalRange: '130-260' },
          { name: '24小时尿钾排泄', unit: 'mmol/24h', normalRange: '25-100' },
          { name: '24小时尿钙排泄', unit: 'mmol/24h', normalRange: '2.5-7.5' },
          { name: '24小时尿磷排泄', unit: 'mmol/24h', normalRange: '12.9-42.0' },
          { name: '24小时尿尿酸排泄', unit: 'mmol/24h', normalRange: '1.5-4.5' },
          { name: '24小时尿尿素氮排泄', unit: 'mmol/24h', normalRange: '250-600' }
        ]
      },
      stool_routine: {
        name: '粪便常规',
        icd10: 'K90-K93',
        subItems: [
          { name: '粪便颜色', unit: '', normalRange: '黄褐色' },
          { name: '粪便性状', unit: '', normalRange: '成形软便' },
          { name: '粪便量', unit: 'g/24h', normalRange: '100-300' },
          { name: '粪便气味', unit: '', normalRange: '正常' },
          { name: '粪便粘液', unit: '', normalRange: '阴性' },
          { name: '粪便脓血', unit: '', normalRange: '阴性' },
          { name: '粪便白细胞', unit: '个/HP', normalRange: '<5' },
          { name: '粪便红细胞', unit: '个/HP', normalRange: '0' },
          { name: '粪便上皮细胞', unit: '个/HP', normalRange: '<5' },
          { name: '粪便脂肪球', unit: '', normalRange: '阴性' },
          { name: '粪便淀粉颗粒', unit: '', normalRange: '阴性' },
          { name: '粪便肌纤维', unit: '', normalRange: '少量' },
          { name: '粪便寄生虫卵', unit: '', normalRange: '阴性' },
          { name: '粪便原虫', unit: '', normalRange: '阴性' },
          { name: '粪便隐血试验', unit: '', normalRange: '阴性' }
        ]
      },
      stool_culture: {
        name: '粪便培养',
        icd10: 'K90-K93',
        subItems: [
          { name: '粪便细菌培养', unit: '', normalRange: '阴性' },
          { name: '粪便真菌培养', unit: '', normalRange: '阴性' },
          { name: '粪便结核杆菌培养', unit: '', normalRange: '阴性' },
          { name: '粪便药敏试验', unit: '', normalRange: '敏感' },
          { name: '粪便艰难梭菌毒素', unit: '', normalRange: '阴性' },
          { name: '粪便轮状病毒', unit: '', normalRange: '阴性' },
          { name: '粪便诺如病毒', unit: '', normalRange: '阴性' },
          { name: '粪便腺病毒', unit: '', normalRange: '阴性' }
        ]
      },
      stool_biochemistry: {
        name: '粪便生化',
        icd10: 'K90-K93',
        subItems: [
          { name: '粪便脂肪定量', unit: 'g/24h', normalRange: '<6' },
          { name: '粪便氮定量', unit: 'g/24h', normalRange: '<2' },
          { name: '粪便钙定量', unit: 'mmol/24h', normalRange: '<5' },
          { name: '粪便铁定量', unit: 'mg/24h', normalRange: '<15' },
          { name: '粪便胰蛋白酶', unit: 'U/g', normalRange: '>20' },
          { name: '粪便糜蛋白酶', unit: 'U/g', normalRange: '>6' },
          { name: '粪便弹性蛋白酶', unit: 'μg/g', normalRange: '>200' },
          { name: '粪便乳铁蛋白', unit: 'μg/g', normalRange: '<7.25' },
          { name: '粪便钙卫蛋白', unit: 'μg/g', normalRange: '<50' },
          { name: '粪便α1-抗胰蛋白酶', unit: 'mg/g', normalRange: '<0.27' }
        ]
      },
      cerebrospinal_fluid_routine: {
        name: '脑脊液常规',
        icd10: 'G00-G09',
        subItems: [
          { name: '脑脊液颜色', unit: '', normalRange: '无色透明' },
          { name: '脑脊液透明度', unit: '', normalRange: '透明' },
          { name: '脑脊液凝固性', unit: '', normalRange: '不凝固' },
          { name: '脑脊液压力', unit: 'mmH2O', normalRange: '70-180' },
          { name: '脑脊液细胞总数', unit: '个/μL', normalRange: '0-5' },
          { name: '脑脊液白细胞', unit: '个/μL', normalRange: '0-5' },
          { name: '脑脊液红细胞', unit: '个/μL', normalRange: '0' },
          { name: '脑脊液中性粒细胞', unit: '%', normalRange: '0-6' },
          { name: '脑脊液淋巴细胞', unit: '%', normalRange: '40-80' },
          { name: '脑脊液单核细胞', unit: '%', normalRange: '15-45' },
          { name: '脑脊液嗜酸性粒细胞', unit: '%', normalRange: '0-1' },
          { name: '脑脊液蛋白定性', unit: '', normalRange: '阴性' },
          { name: '脑脊液糖定性', unit: '', normalRange: '阳性' },
          { name: '脑脊液氯化物定性', unit: '', normalRange: '阳性' }
        ]
      },
      cerebrospinal_fluid_biochemistry: {
        name: '脑脊液生化',
        icd10: 'G00-G09',
        subItems: [
          { name: '脑脊液蛋白定量', unit: 'mg/L', normalRange: '150-450' },
          { name: '脑脊液糖定量', unit: 'mmol/L', normalRange: '2.5-4.5' },
          { name: '脑脊液氯化物', unit: 'mmol/L', normalRange: '120-130' },
          { name: '脑脊液乳酸', unit: 'mmol/L', normalRange: '1.1-2.4' },
          { name: '脑脊液乳酸脱氢酶', unit: 'U/L', normalRange: '<40' },
          { name: '脑脊液腺苷脱氨酶', unit: 'U/L', normalRange: '<8' },
          { name: '脑脊液肌酸激酶', unit: 'U/L', normalRange: '<5' },
          { name: '脑脊液谷草转氨酶', unit: 'U/L', normalRange: '<20' },
          { name: '脑脊液谷丙转氨酶', unit: 'U/L', normalRange: '<15' },
          { name: '脑脊液碱性磷酸酶', unit: 'U/L', normalRange: '<20' },
          { name: '脑脊液γ-谷氨酰转移酶', unit: 'U/L', normalRange: '<5' },
          { name: '脑脊液胆碱酯酶', unit: 'U/L', normalRange: '0.5-2.0' },
          { name: '脑脊液β2-微球蛋白', unit: 'mg/L', normalRange: '<2.0' },
          { name: '脑脊液免疫球蛋白G', unit: 'mg/L', normalRange: '10-40' },
          { name: '脑脊液免疫球蛋白A', unit: 'mg/L', normalRange: '0-6' },
          { name: '脑脊液免疫球蛋白M', unit: 'mg/L', normalRange: '0-1.3' },
          { name: '脑脊液白蛋白', unit: 'mg/L', normalRange: '100-300' },
          { name: '脑脊液转铁蛋白', unit: 'mg/L', normalRange: '10-30' },
          { name: '脑脊液前白蛋白', unit: 'mg/L', normalRange: '10-40' }
        ]
      },
      cerebrospinal_fluid_culture: {
        name: '脑脊液培养',
        icd10: 'G00-G09',
        subItems: [
          { name: '脑脊液细菌培养', unit: '', normalRange: '阴性' },
          { name: '脑脊液真菌培养', unit: '', normalRange: '阴性' },
          { name: '脑脊液结核杆菌培养', unit: '', normalRange: '阴性' },
          { name: '脑脊液药敏试验', unit: '', normalRange: '敏感' },
          { name: '脑脊液病毒检测', unit: '', normalRange: '阴性' },
          { name: '脑脊液支原体检测', unit: '', normalRange: '阴性' },
          { name: '脑脊液衣原体检测', unit: '', normalRange: '阴性' },
          { name: '脑脊液隐球菌抗原', unit: '', normalRange: '阴性' }
        ]
      },
      pleural_fluid_routine: {
        name: '胸水常规',
        icd10: 'J90-J94',
        subItems: [
          { name: '胸水颜色', unit: '', normalRange: '淡黄色' },
          { name: '胸水透明度', unit: '', normalRange: '透明' },
          { name: '胸水比重', unit: '', normalRange: '<1.016' },
          { name: '胸水pH值', unit: '', normalRange: '7.40-7.45' },
          { name: '胸水细胞总数', unit: '个/μL', normalRange: '<1000' },
          { name: '胸水白细胞', unit: '个/μL', normalRange: '<500' },
          { name: '胸水红细胞', unit: '个/μL', normalRange: '<1000' },
          { name: '胸水中性粒细胞', unit: '%', normalRange: '<25' },
          { name: '胸水淋巴细胞', unit: '%', normalRange: '>50' },
          { name: '胸水单核细胞', unit: '%', normalRange: '<30' },
          { name: '胸水嗜酸性粒细胞', unit: '%', normalRange: '<10' },
          { name: '胸水间皮细胞', unit: '%', normalRange: '<5' },
          { name: '胸水蛋白定性', unit: '', normalRange: '阴性' },
          { name: '胸水糖定性', unit: '', normalRange: '阳性' },
          { name: '胸水李凡他试验', unit: '', normalRange: '阴性' }
        ]
      },
      pleural_fluid_biochemistry: {
        name: '胸水生化',
        icd10: 'J90-J94',
        subItems: [
          { name: '胸水蛋白定量', unit: 'g/L', normalRange: '<30' },
          { name: '胸水糖定量', unit: 'mmol/L', normalRange: '>3.3' },
          { name: '胸水乳酸脱氢酶', unit: 'U/L', normalRange: '<200' },
          { name: '胸水腺苷脱氨酶', unit: 'U/L', normalRange: '<40' },
          { name: '胸水淀粉酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '胸水脂肪酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '胸水碱性磷酸酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '胸水γ-谷氨酰转移酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '胸水肌酐', unit: 'μmol/L', normalRange: '<血清水平' },
          { name: '胸水尿素氮', unit: 'mmol/L', normalRange: '<血清水平' },
          { name: '胸水尿酸', unit: 'μmol/L', normalRange: '<血清水平' },
          { name: '胸水胆固醇', unit: 'mmol/L', normalRange: '<1.55' },
          { name: '胸水甘油三酯', unit: 'mmol/L', normalRange: '<0.57' },
          { name: '胸水白蛋白', unit: 'g/L', normalRange: '<20' },
          { name: '胸水球蛋白', unit: 'g/L', normalRange: '<10' },
          { name: '胸水纤维蛋白原', unit: 'g/L', normalRange: '<0.5' },
          { name: '胸水C反应蛋白', unit: 'mg/L', normalRange: '<10' },
          { name: '胸水铁蛋白', unit: 'μg/L', normalRange: '<200' },
          { name: '胸水癌胚抗原', unit: 'μg/L', normalRange: '<5' },
          { name: '胸水糖类抗原125', unit: 'U/mL', normalRange: '<35' },
          { name: '胸水糖类抗原19-9', unit: 'U/mL', normalRange: '<37' },
          { name: '胸水细胞角蛋白19片段', unit: 'ng/mL', normalRange: '<3.3' }
        ]
      },
      pleural_fluid_culture: {
        name: '胸水培养',
        icd10: 'J90-J94',
        subItems: [
          { name: '胸水细菌培养', unit: '', normalRange: '阴性' },
          { name: '胸水真菌培养', unit: '', normalRange: '阴性' },
          { name: '胸水结核杆菌培养', unit: '', normalRange: '阴性' },
          { name: '胸水药敏试验', unit: '', normalRange: '敏感' },
          { name: '胸水病毒检测', unit: '', normalRange: '阴性' },
          { name: '胸水支原体检测', unit: '', normalRange: '阴性' },
          { name: '胸水衣原体检测', unit: '', normalRange: '阴性' }
        ]
      },
      ascites_routine: {
        name: '腹水常规',
        icd10: 'K70-K77',
        subItems: [
          { name: '腹水颜色', unit: '', normalRange: '淡黄色' },
          { name: '腹水透明度', unit: '', normalRange: '透明' },
          { name: '腹水比重', unit: '', normalRange: '<1.016' },
          { name: '腹水pH值', unit: '', normalRange: '7.40-7.45' },
          { name: '腹水细胞总数', unit: '个/μL', normalRange: '<500' },
          { name: '腹水白细胞', unit: '个/μL', normalRange: '<250' },
          { name: '腹水红细胞', unit: '个/μL', normalRange: '<1000' },
          { name: '腹水中性粒细胞', unit: '%', normalRange: '<25' },
          { name: '腹水淋巴细胞', unit: '%', normalRange: '>50' },
          { name: '腹水单核细胞', unit: '%', normalRange: '<30' },
          { name: '腹水嗜酸性粒细胞', unit: '%', normalRange: '<10' },
          { name: '腹水间皮细胞', unit: '%', normalRange: '<5' },
          { name: '腹水蛋白定性', unit: '', normalRange: '阴性' },
          { name: '腹水糖定性', unit: '', normalRange: '阳性' },
          { name: '腹水李凡他试验', unit: '', normalRange: '阴性' }
        ]
      },
      ascites_biochemistry: {
        name: '腹水生化',
        icd10: 'K70-K77',
        subItems: [
          { name: '腹水蛋白定量', unit: 'g/L', normalRange: '<25' },
          { name: '腹水糖定量', unit: 'mmol/L', normalRange: '>3.3' },
          { name: '腹水乳酸脱氢酶', unit: 'U/L', normalRange: '<200' },
          { name: '腹水腺苷脱氨酶', unit: 'U/L', normalRange: '<40' },
          { name: '腹水淀粉酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '腹水脂肪酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '腹水碱性磷酸酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '腹水γ-谷氨酰转移酶', unit: 'U/L', normalRange: '<血清水平' },
          { name: '腹水肌酐', unit: 'μmol/L', normalRange: '<血清水平' },
          { name: '腹水尿素氮', unit: 'mmol/L', normalRange: '<血清水平' },
          { name: '腹水尿酸', unit: 'μmol/L', normalRange: '<血清水平' },
          { name: '腹水胆固醇', unit: 'mmol/L', normalRange: '<1.55' },
          { name: '腹水甘油三酯', unit: 'mmol/L', normalRange: '<0.57' },
          { name: '腹水白蛋白', unit: 'g/L', normalRange: '<15' },
          { name: '腹水球蛋白', unit: 'g/L', normalRange: '<10' },
          { name: '腹水纤维蛋白原', unit: 'g/L', normalRange: '<0.5' },
          { name: '腹水C反应蛋白', unit: 'mg/L', normalRange: '<10' },
          { name: '腹水铁蛋白', unit: 'μg/L', normalRange: '<200' },
          { name: '腹水癌胚抗原', unit: 'μg/L', normalRange: '<5' },
          { name: '腹水糖类抗原125', unit: 'U/mL', normalRange: '<35' },
          { name: '腹水糖类抗原19-9', unit: 'U/mL', normalRange: '<37' },
          { name: '腹水细胞角蛋白19片段', unit: 'ng/mL', normalRange: '<3.3' },
          { name: '腹水甲胎蛋白', unit: 'μg/L', normalRange: '<20' },
          { name: '腹水α-L-岩藻糖苷酶', unit: 'U/L', normalRange: '<40' }
        ]
      },
      ascites_culture: {
        name: '腹水培养',
        icd10: 'K70-K77',
        subItems: [
          { name: '腹水细菌培养', unit: '', normalRange: '阴性' },
          { name: '腹水真菌培养', unit: '', normalRange: '阴性' },
          { name: '腹水结核杆菌培养', unit: '', normalRange: '阴性' },
          { name: '腹水药敏试验', unit: '', normalRange: '敏感' },
          { name: '腹水病毒检测', unit: '', normalRange: '阴性' },
          { name: '腹水支原体检测', unit: '', normalRange: '阴性' },
          { name: '腹水衣原体检测', unit: '', normalRange: '阴性' }
        ]
      },
      other_body_fluids: {
        name: '其他体液',
        icd10: 'N00-N99',
        subItems: [
          { name: '关节液常规', unit: '', normalRange: '正常' },
          { name: '关节液培养', unit: '', normalRange: '阴性' },
          { name: '心包积液常规', unit: '', normalRange: '正常' },
          { name: '心包积液培养', unit: '', normalRange: '阴性' },
          { name: '精液常规', unit: '', normalRange: '正常' },
          { name: '精液培养', unit: '', normalRange: '阴性' },
          { name: '阴道分泌物常规', unit: '', normalRange: '正常' },
          { name: '阴道分泌物培养', unit: '', normalRange: '阴性' },
          { name: '前列腺液常规', unit: '', normalRange: '正常' },
          { name: '前列腺液培养', unit: '', normalRange: '阴性' },
          { name: '泪液检测', unit: '', normalRange: '正常' },
          { name: '唾液检测', unit: '', normalRange: '正常' },
          { name: '汗液检测', unit: '', normalRange: '正常' },
          { name: '羊水检测', unit: '', normalRange: '正常' },
          { name: '脐血检测', unit: '', normalRange: '正常' }
        ]
      }
    }
  },
  tissue_tests: {
    name: '组织检测',
    icd10: 'C00-D48',
    tests: {
      pathology: {
        name: '病理检测',
        icd10: 'C00-D48',
        subItems: [
          { name: '组织病理学', unit: '', normalRange: '正常' },
          { name: '细胞病理学', unit: '', normalRange: '正常' },
          { name: '免疫组织化学', unit: '', normalRange: '正常' },
          { name: '分子病理学', unit: '', normalRange: '正常' },
          { name: '原位杂交', unit: '', normalRange: '正常' },
          { name: '基因检测', unit: '', normalRange: '正常' }
        ]
      },
      cytology: {
        name: '细胞学检测',
        icd10: 'C00-D48',
        subItems: [
          { name: '宫颈细胞学', unit: '', normalRange: '正常' },
          { name: '痰细胞学', unit: '', normalRange: '正常' },
          { name: '胸水细胞学', unit: '', normalRange: '正常' },
          { name: '腹水细胞学', unit: '', normalRange: '正常' },
          { name: '脑脊液细胞学', unit: '', normalRange: '正常' },
          { name: '细针穿刺细胞学', unit: '', normalRange: '正常' }
        ]
      },
      microbiology: {
        name: '微生物检测',
        icd10: 'A00-B99',
        subItems: [
          { name: '细菌培养', unit: '', normalRange: '阴性' },
          { name: '真菌培养', unit: '', normalRange: '阴性' },
          { name: '病毒检测', unit: '', normalRange: '阴性' },
          { name: '支原体检测', unit: '', normalRange: '阴性' },
          { name: '衣原体检测', unit: '', normalRange: '阴性' },
          { name: '结核杆菌检测', unit: '', normalRange: '阴性' }
        ]
      }
    }
  }
};

// 获取所有检验项目分类
export const getLabTestCategories = () => {
  return Object.keys(labTestCategories).map(key => ({
    key,
    name: labTestCategories[key].name,
    icd10: labTestCategories[key].icd10
  }));
};

// 获取指定分类下的检验项目
export const getLabTestsByCategory = (categoryKey) => {
  const category = labTestCategories[categoryKey];
  if (!category) return [];
  
  return Object.keys(category.tests).map(key => ({
    key,
    name: category.tests[key].name,
    icd10: category.tests[key].icd10
  }));
};

// 获取指定检验项目的子项目
export const getLabTestSubItems = (categoryKey, testKey) => {
  const category = labTestCategories[categoryKey];
  if (!category || !category.tests[testKey]) return [];
  
  return category.tests[testKey].subItems;
};

// 根据子项目名称获取详细信息
export const getSubItemInfo = (categoryKey, testKey, subItemName) => {
  const subItems = getLabTestSubItems(categoryKey, testKey);
  return subItems.find(item => item.name === subItemName);
}; 