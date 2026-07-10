<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  roleId: { type: String, required: true },
  rolePath: { type: String, required: true },
  skills: {
    type: Array,
    default: () => []
  },
  activation: { type: String, default: '' }
})

const status = ref('')

const triggerText = computed(() => {
  const lines = [
    `@${props.rolePath}`,
    props.activation ? props.activation : `以 ${props.roleId} 身份，按角色说明书执行当前任务。`
  ]
  if (props.skills.length) {
    lines.push('')
    lines.push('建议按序阅读技能：')
    props.skills.forEach((s, i) => {
      lines.push(`${i + 1}. @standards/.../${s.id}/SKILL.md （或打开站点 ${s.uri}）`)
    })
  }
  return lines.join('\n')
})

const exportMd = computed(() => {
  const skillLines = props.skills
    .map(
      (s, i) =>
        `${i + 1}. \`${s.id}\` — 站点 ${s.uri} — 源 \`standards/...\``
    )
    .join('\n')
  return [
    `# 任务上下文清单 — ${props.roleId}`,
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 角色',
    '',
    `- ID：\`${props.roleId}\``,
    `- 源路径：\`${props.rolePath}\``,
    `- Cursor：\`@${props.rolePath}\``,
    props.activation ? `- 一句话激活：${props.activation}` : '',
    '',
    '## 绑定技能（建议阅读顺序）',
    '',
    skillLines || '_无_',
    '',
    '## 使用方式',
    '',
    '1. 在 Cursor 中 `@` 角色 md',
    '2. 按序 `@` 技能 SKILL.md（可选）',
    '3. 粘贴一句话激活并描述任务',
    '',
    '> 本清单由 Agents Skill Site 导出；网站不执行模型推理。',
    ''
  ]
    .filter((l) => l !== '')
    .join('\n')
})

async function copyTrigger() {
  try {
    await navigator.clipboard.writeText(triggerText.value)
    status.value = '已复制触发句到剪贴板'
  } catch {
    status.value = '复制失败，请手动选择下方文本'
  }
}

function downloadMd() {
  const blob = new Blob([exportMd.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-context-${props.roleId}.md`
  a.click()
  URL.revokeObjectURL(url)
  status.value = '已下载任务上下文清单'
}

function skillHref(uri) {
  return withBase(uri.endsWith('/') ? uri : `${uri}/`)
}
</script>

<template>
  <div class="run-guide">
    <h3>运行指引</h3>
    <p class="hint">本站不执行推理；复制后到 Cursor 粘贴使用。</p>

    <div class="actions">
      <button type="button" @click="copyTrigger">复制 Cursor 触发句</button>
      <button type="button" class="secondary" @click="downloadMd">导出任务上下文 .md</button>
    </div>
    <p v-if="status" class="hint">{{ status }}</p>

    <h4>绑定技能读取顺序</h4>
    <ol v-if="skills.length">
      <li v-for="s in skills" :key="s.id">
        <a :href="skillHref(s.uri)">{{ s.label || s.id }}</a>
        <code>（{{ s.id }}）</code>
      </li>
    </ol>
    <p v-else class="hint">本角色暂无矩阵必显技能。</p>

    <details>
      <summary>预览触发句</summary>
      <pre><code>{{ triggerText }}</code></pre>
    </details>
  </div>
</template>
