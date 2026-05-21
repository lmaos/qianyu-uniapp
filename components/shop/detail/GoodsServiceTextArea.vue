<template>
	<view class="goods-service-card">
		<text class="goods-service-title">商家服务说明</text>
		<rich-text class="goods-service-rich-text" :nodes="serviceNodes"></rich-text>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	markdownText: {
		type: String,
		default: ''
	}
})

// 服务说明区域支持 markdown 文本，先在组件内转换成 rich-text 可用内容。
const serviceNodes = computed(() => {
	return convertMarkdownToHtml(props.markdownText)
})

function convertMarkdownToHtml(markdownText) {
	const source = `${markdownText || ''}`.trim()
	if (!source) {
		return `<p style="font-size:24rpx;line-height:36rpx;color:#667085;">暂无服务说明</p>`
	}

	const lines = source.split('\n')
	let html = ''
	let inList = false

	lines.forEach((rawLine) => {
		const line = rawLine.trim()

		if (!line) {
			if (inList) {
				html += '</ul>'
				inList = false
			}
			return
		}

		if (line.startsWith('## ')) {
			if (inList) {
				html += '</ul>'
				inList = false
			}
			html += `<h3 style="margin:18rpx 0 12rpx;font-size:28rpx;line-height:38rpx;color:#111827;">${renderInlineMarkdown(line.slice(3))}</h3>`
			return
		}

		if (line.startsWith('- ')) {
			if (!inList) {
				html += '<ul style="padding-left:28rpx;margin:0;">'
				inList = true
			}
			html += `<li style="margin:10rpx 0;font-size:24rpx;line-height:36rpx;color:#475467;">${renderInlineMarkdown(line.slice(2))}</li>`
			return
		}

		if (inList) {
			html += '</ul>'
			inList = false
		}

		html += `<p style="margin:10rpx 0;font-size:24rpx;line-height:38rpx;color:#475467;">${renderInlineMarkdown(line)}</p>`
	})

	if (inList) {
		html += '</ul>'
	}

	return html
}

function renderInlineMarkdown(text) {
	const escapedText = `${text || ''}`
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	return escapedText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
</script>

<style scoped>
.goods-service-card {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-service-title {
	display: block;
	margin-bottom: 10rpx;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}
</style>
