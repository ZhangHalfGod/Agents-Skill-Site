<script setup>
import { computed, ref } from 'vue'
import { withBase, useData } from 'vitepress'

const props = defineProps({
  roleId: { type: String, required: true },
  rolePath: { type: String, required: true },
  skills: {
    type: Array,
    default: () => []
  },
  activation: { type: String, default: '' }
})

const { localeIndex } = useData()
const isEn = computed(() => localeIndex.value === 'root')
const status = ref('')

function skillDocsPath(s) {
  if (s.source) return s.source
  const uri = String(s.uri || '')
    .replace(/^\/zh(?=\/)/, '')
    .replace(/\/$/, '')
  const docsPrefix = props.rolePath.startsWith('docs/zh/')
    ? 'docs/zh'
    : 'docs'
  if (uri.startsWith('/skills/')) {
    return `${docsPrefix}${uri}/index.md`
  }
  return `${docsPrefix}/skills/${s.id}/index.md`
}

const activationLine = computed(() => {
  if (props.activation) return props.activation
  return isEn.value
    ? `As ${props.roleId}, follow the role playbook for the current task.`
    : `以 ${props.roleId} 身份，按角色说明书执行当前任务。`
})

const triggerText = computed(() => {
  const lines = [`@${props.rolePath}`, activationLine.value]
  if (props.skills.length) {
    lines.push('')
    lines.push(
      isEn.value
        ? 'Suggested skill reading order:'
        : '建议按序阅读技能：'
    )
    props.skills.forEach((s, i) => {
      const docs = skillDocsPath(s)
      lines.push(
        isEn.value
          ? `${i + 1}. @${docs} (or open site ${s.uri})`
          : `${i + 1}. @${docs} （或打开站点 ${s.uri}）`
      )
    })
  }
  return lines.join('\n')
})

const exportMd = computed(() => {
  if (isEn.value) {
    const skillLines = props.skills
      .map(
        (s, i) =>
          `${i + 1}. \`${s.id}\` — site ${s.uri} — source \`${skillDocsPath(s)}\``
      )
      .join('\n')
    return [
      `# Task context — ${props.roleId}`,
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Role',
      '',
      `- ID: \`${props.roleId}\``,
      `- Path: \`${props.rolePath}\``,
      `- Cursor: \`@${props.rolePath}\``,
      props.activation ? `- Activation: ${props.activation}` : '',
      '',
      '## Bound skills (suggested order)',
      '',
      skillLines || '_None_',
      '',
      '## How to use',
      '',
      '1. In Cursor, `@` the role markdown',
      '2. Optionally `@` skill pages in order',
      '3. Paste the activation line and describe the task',
      '',
      '> Exported from Agents Skill Site; this site does not run model inference.',
      ''
    ]
      .filter((l) => l !== '')
      .join('\n')
  }

  const skillLines = props.skills
    .map(
      (s, i) =>
        `${i + 1}. \`${s.id}\` — 站点 ${s.uri} — 源 \`${skillDocsPath(s)}\``
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
    '2. 按序 `@` 技能页（可选）',
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
    status.value = isEn.value
      ? 'Copied trigger to clipboard'
      : '已复制触发句到剪贴板'
  } catch {
    status.value = isEn.value
      ? 'Copy failed — select the preview text manually'
      : '复制失败，请手动选择下方文本'
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
  status.value = isEn.value
    ? 'Downloaded task context checklist'
    : '已下载任务上下文清单'
}

function skillHref(uri) {
  const path = uri.endsWith('/') ? uri : `${uri}/`
  // EN pages pass uri without /zh; ZH pages pass /zh/...
  return withBase(path)
}
</script>

<template>
  <div class="run-guide">
    <h3>{{ isEn ? 'Run guide' : '运行指引' }}</h3>
    <p class="hint">
      {{
        isEn
          ? 'Site browse: copy this trigger into Cursor (@ paths below). For MCP, call get_agent/get_skill and @ the returned source (docs/zh/...), not these English paths. Workspace must include this repo.'
          : '浏览站点：复制下方触发句到 Cursor（@ 页内路径）。走 MCP 时请 get_agent/get_skill 后 @ 返回的 source（本仓 docs/zh/...），不要混用英文站路径。工作区需打开本仓库。'
      }}
    </p>

    <div class="actions">
      <button type="button" @click="copyTrigger">
        {{ isEn ? 'Copy Cursor trigger' : '复制 Cursor 触发句' }}
      </button>
      <button type="button" class="secondary" @click="downloadMd">
        {{ isEn ? 'Export task context .md' : '导出任务上下文 .md' }}
      </button>
    </div>
    <p v-if="status" class="hint">{{ status }}</p>

    <h4>{{ isEn ? 'Bound skill reading order' : '绑定技能读取顺序' }}</h4>
    <ol v-if="skills.length">
      <li v-for="s in skills" :key="s.id">
        <a :href="skillHref(s.uri)">{{ s.label || s.id }}</a>
        <code>{{ isEn ? `(${s.id})` : `（${s.id}）` }}</code>
      </li>
    </ol>
    <p v-else class="hint">
      {{
        isEn
          ? 'No required skills in the matrix for this role.'
          : '本角色暂无矩阵必显技能。'
      }}
    </p>

    <details>
      <summary>{{ isEn ? 'Preview trigger' : '预览触发句' }}</summary>
      <pre><code>{{ triggerText }}</code></pre>
    </details>
  </div>
</template>
