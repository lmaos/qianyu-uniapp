<template>
	<UserSubPageLayout title="更多设置" @back="handleBack">
		<UserSectionCard>
			<UserMenuList :item-list="pageMock.menuList" @select="handleMenuSelect" />
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserMenuList from '@/components/user-center/common/UserMenuList.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getMoreSettingsPageMock } from '@/components/user-center/userCenterMock.js'
import { logoutToLogin } from '@/composables/useLoginSession.js'

const pageMock = ref(getMoreSettingsPageMock())

onLoad((options) => {
	pageMock.value = getMoreSettingsPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleMenuSelect(item) {
	onMenuSelect(item)
	const targetUrl = pageMock.value.actionUrlMap?.[item.key]
	if (targetUrl) {
		uni.navigateTo({
			url: targetUrl
		})
		return
	}

	if (item.key === 'logout') {
		uni.showModal({
			title: '退出登录',
			content: '确定要退出当前账号吗？',
			success: (res) => {
				if (res.confirm) {
					logoutToLogin()
				}
			}
		})
		return
	}

	if (item.key === 'destroy') {
		uni.showModal({
			title: item.label,
			content: `${item.label}流程占位，后续可直接替换真实接口。`
		})
		return
	}

	uni.showToast({
		title: `${item.label}占位`,
		icon: 'none'
	})
}

function onMenuSelect(item) {
	// TODO：替换更多设置点击逻辑
	console.log('user-more-settings-click', item.key)
}
</script>
