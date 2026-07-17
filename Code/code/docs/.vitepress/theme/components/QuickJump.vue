<script setup>
import { computed, ref } from 'vue'
import { withBase, useRouter, useData } from 'vitepress'

const input = ref('')
const hint = ref('示例：使用角色 2　或　使用技能 1 / role 2 / skill 1')

const AGENTS = {
  1: '/agents/standard/ProductManager/',
  2: '/agents/standard/Architect/',
  3: '/agents/standard/DevLead/',
  4: '/agents/standard/TestEngineer/',
  5: '/agents/standard/SecurityEngineer/',
  6: '/agents/standard/OpsEngineer/',
  7: '/agents/standard/UIDesigner/',
  8: '/agents/standard/NmosEngineer/'
}

const SKILLS = {
  1: '/skills/custom/common/ai-code-boundary/',
  2: '/skills/custom/common/traceability-compliance/',
  3: '/skills/custom/common/prompt-versioning/',
  4: '/skills/custom/common/stage-gate-flow/',
  5: '/skills/external/doc-coauthoring/',
  6: '/skills/external/mcp-builder/',
  7: '/skills/external/frontend-design/',
  8: '/skills/external/webapp-testing/',
  9: '/skills/external/web-artifacts-builder/',
  10: '/skills/external/skill-creator/',
  11: '/skills/external/Human/'
}

const { localeIndex } = useData()
const router = useRouter()

const localePrefix = computed(() =>
  localeIndex.value === 'root' ? '' : `/${localeIndex.value}`
)

function withLocale(path) {
  return `${localePrefix.value}${path}`
}

function go() {
  const text = input.value.trim()
  let m =
    text.match(/使用角色\s*(\d+)/i) ||
    text.match(/^角色\s*(\d+)$/i) ||
    text.match(/^r(?:ole)?\s*(\d+)$/i)
  if (m) {
    const path = AGENTS[Number(m[1])]
    if (!path) {
      hint.value = `未知角色序号 ${m[1]}（1～8）`
      return
    }
    router.go(withBase(withLocale(path)))
    return
  }
  m =
    text.match(/使用技能\s*(\d+)/i) ||
    text.match(/^技能\s*(\d+)$/i) ||
    text.match(/^s(?:kill)?\s*(\d+)$/i)
  if (m) {
    const path = SKILLS[Number(m[1])]
    if (!path) {
      hint.value = `未知技能序号 ${m[1]}（1～11）`
      return
    }
    router.go(withBase(withLocale(path)))
    return
  }
  hint.value = '请输入「使用角色 N」或「使用技能 N」 / role N / skill N'
}
</script>

<template>
  <div class="quick-jump">
    <h3>{{ localeIndex === 'root' ? 'Number jump' : '编号快捷跳转' }}</h3>
    <div class="row">
      <input
        v-model="input"
        type="text"
        :placeholder="
          localeIndex === 'root'
            ? 'role 2 / skill 1'
            : '使用角色 2 / 使用技能 1'
        "
        @keyup.enter="go"
      />
      <button type="button" @click="go">
        {{ localeIndex === 'root' ? 'Go' : '跳转' }}
      </button>
    </div>
    <p class="hint">{{ hint }}</p>
  </div>
</template>
