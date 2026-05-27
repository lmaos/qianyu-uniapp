<template>
	<view class="agreement-page">
		<SafeTopArea
			:side-padding-rpx="24"
			:safe-gap-rpx="24"
			:inner-min-height-rpx="88"
			background="rgba(248, 250, 252, 0.96)"
			border-bottom="1rpx solid rgba(226, 232, 240, 0.76)"
		>
			<view class="agreement-header">
				<view class="agreement-back" @tap="handleBack">
					<text class="agreement-back-text">&lt;</text>
				</view>
				<text class="agreement-title">{{ pageTitle }}</text>
				<view class="agreement-placeholder"></view>
			</view>
		</SafeTopArea>

		<scroll-view class="agreement-scroll" :style="scrollStyle" scroll-y>
			<view class="agreement-content">
				<view class="agreement-summary-card">
					<text class="agreement-summary-title">{{ pageTitle }}</text>
					<text class="agreement-summary-meta">更新日期：{{ documentContent.updatedAt }}</text>
					<text class="agreement-summary-meta">生效日期：{{ documentContent.effectiveAt }}</text>
					<text class="agreement-summary-text">{{ documentContent.summary }}</text>
				</view>

				<view
					v-for="section in documentContent.sections"
					:key="section.title"
					class="agreement-section"
				>
					<text class="agreement-section-title">{{ section.title }}</text>
					<text
						v-for="paragraph in section.paragraphs"
						:key="paragraph"
						class="agreement-section-text"
					>
						{{ paragraph }}
					</text>
				</view>

				<view class="agreement-footer-card">
					<text class="agreement-footer-title">特别提示</text>
					<text class="agreement-footer-text">
						如您对本协议或本政策有任何疑问、意见或建议，可通过平台客服、意见反馈入口或运营方公示的联系方式与我们联系。
					</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SafeTopArea from '@/components/common/SafeTopArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { getAgreementPageTitle } from '@/composables/useLoginAgreement.js'

const documentType = ref('user')

const AGREEMENT_CONTENT_MAP = {
	user: {
		updatedAt: '2026年05月27日',
		effectiveAt: '2026年05月27日',
		summary: '欢迎您使用千隅平台服务。为保障平台、用户与合作方的合法权益，请您在注册、登录、发布内容、购买或使用虚拟商品及虚拟权益前，认真阅读并充分理解本协议全部内容。',
		sections: [
			{
				title: '一、协议适用范围',
				paragraphs: [
					'本协议适用于您通过千隅客户端、H5 页面及相关服务入口使用我们提供的社交互动、内容浏览、私信聊天、直播互动、虚拟商品购买、虚拟权益兑换等服务。',
					'当您点击同意、注册、登录、勾选确认或实际使用平台服务时，即视为您已阅读、理解并接受本协议及平台已公示的相关规则、说明和政策。'
				]
			},
			{
				title: '二、账号注册与使用',
				paragraphs: [
					'您应当使用真实、合法、有效且归属于您本人的手机号码或其他允许的方式注册和登录账号，并妥善保管账号、密码、验证码及相关登录凭证。',
					'您不得冒用、盗用、出租、出借、出售账号，不得通过批量注册、恶意养号、外挂脚本、异常设备集群等方式获取或使用平台账号。',
					'因您保管不善导致账号被他人使用、盗刷、冒用、信息泄露或发生其他损失的，原则上由您自行承担相应责任。'
				]
			},
			{
				title: '三、平台服务内容',
				paragraphs: [
					'平台为您提供包括但不限于用户资料展示、关注关系、内容发布与互动、即时通讯、直播间互动、商品展示、订单承接、虚拟礼物、虚拟道具、会员权益及其他经平台实际开放的服务。',
					'部分功能可能因设备类型、系统版本、实名认证状态、地域、网络环境或业务策略不同而存在差异，具体以页面展示和实际开放状态为准。',
					'平台有权根据运营需要对服务内容、页面样式、入口位置、收费方式、功能状态和活动规则进行调整、升级、中断或下线。'
				]
			},
			{
				title: '四、内容发布与社交互动规范',
				paragraphs: [
					'您在平台发布、上传、评论、私信、直播发言、头像昵称、简介及其他互动内容时，应遵守法律法规、公序良俗及平台社区规则，不得发布违法违规、侵权、欺诈、骚扰、色情低俗、引战辱骂、刷量引流等内容。',
					'您应保证对您发布的内容享有合法权利或已取得充分授权。因内容侵权、失实宣传、违法违规或侵犯他人合法权益引发的纠纷、投诉、索赔及处罚，由您自行承担责任。',
					'为维护平台秩序与用户体验，平台有权对违规内容采取删除、屏蔽、限制展示、禁言、限流、冻结功能、封禁账号等处理措施。'
				]
			},
			{
				title: '五、虚拟商品、虚拟权益与支付规则',
				paragraphs: [
					'平台内展示的虚拟礼物、虚拟道具、会员标识、勋章、增值权益及其他数字化服务内容，仅限在平台规则允许的范围内使用，不具备法定货币属性，不得进行线下交易、非法倒卖或用于其他违法活动。',
					'涉及充值、购买、订阅、打赏、赠送、兑换等付费行为的，请您在下单前仔细确认商品或权益名称、数量、价格、使用说明和有效期限。除法律法规另有规定或页面另有明确约定外，已完成交付的虚拟商品和虚拟权益通常不支持无理由退换。',
					'如您发现订单异常、重复扣费、权益未到账等情况，可按照平台公示流程申请核查处理；对于通过异常手段套利、刷单、洗钱、欺诈或违规转移权益的行为，平台有权撤销交易、冻结资产并追究责任。'
				]
			},
			{
				title: '六、未成年人保护',
				paragraphs: [
					'若您为未成年人，应在监护人陪同下阅读本协议，并在取得监护人同意后使用平台服务。',
					'涉及直播互动、充值消费、购买虚拟商品或开通增值权益等行为时，未成年人应在法律法规允许及监护人明确同意的前提下进行。',
					'平台将根据法律法规、监管要求及业务需要采取适龄提示、消费提醒、功能限制、时长控制等未成年人保护措施。'
				]
			},
			{
				title: '七、责任限制与违约处理',
				paragraphs: [
					'在法律允许范围内，对于因网络故障、系统维护、黑客攻击、第三方服务异常、不可抗力或非平台可控原因导致的服务中断、信息丢失、页面异常、订单延迟等情况，平台将在合理范围内尽力修复，但不对由此造成的间接损失承担责任。',
					'如您违反本协议、平台规则或法律法规，平台有权独立判断并采取警示、限制功能、暂停服务、终止服务、扣回违规收益、封禁账号等措施；如造成平台或第三方损失，您还应依法承担赔偿责任。'
				]
			},
			{
				title: '八、协议变更与联系',
				paragraphs: [
					'平台有权根据业务发展、法律法规变化及监管要求更新本协议内容，更新后的协议将通过页面公示、弹窗提示、站内消息或其他合理方式通知您。',
					'若您在协议更新后继续使用平台服务，即视为您接受修订后的协议；若您不同意修订内容，应停止使用相关服务并按平台指引办理注销或退出。'
				]
			}
		]
	},
	privacy: {
		updatedAt: '2026年05月27日',
		effectiveAt: '2026年05月27日',
		summary: '本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息，以及您如何行使相关权利。请您在使用平台服务前认真阅读本政策。',
		sections: [
			{
				title: '一、我们收集的信息类型',
				paragraphs: [
					'为实现账号注册、登录、身份识别、消息通知、内容展示、互动沟通、订单处理、支付结算、风控安全及客服支持等功能，我们可能收集您的账号信息、手机号、头像昵称、设备信息、日志信息、网络信息、交易记录、客服联系记录等必要信息。',
					'当您使用内容发布、上传头像、发送图片或视频、语音互动、直播开播、位置展示、扫一扫等功能时，我们会在获得您授权后收集相应的相册、相机、麦克风、存储、位置信息或其他对应权限范围内的信息。',
					'当您购买虚拟商品、虚拟权益或其他增值服务时，我们可能收集与订单、支付结果、充值记录、消费记录及售后处理相关的信息。'
				]
			},
			{
				title: '二、信息使用目的',
				paragraphs: [
					'我们收集和使用个人信息，主要用于向您提供账号登录、社交互动、内容推荐、聊天通讯、订单履约、虚拟权益发放、支付确认、安全风控、故障排查、运营统计及客户服务。',
					'在不违反法律法规的前提下，我们还可能基于去标识化、汇总化后的数据开展产品分析、体验优化、服务改进和商业决策，但不会据此识别到特定自然人身份。',
					'未经您的同意，我们不会将您的个人信息用于超出本政策载明范围之外的其他用途；如确需变更使用目的，我们将依法另行提示并征得您的授权同意。'
				]
			},
			{
				title: '三、设备权限调用说明',
				paragraphs: [
					'相机/相册权限：用于上传头像、发布图片视频内容、发送聊天图片、保存或选择平台素材。',
					'麦克风权限：用于语音聊天、语音消息、直播语音互动等场景。',
					'存储权限：用于缓存图片、视频、日志文件及保存下载内容。',
					'位置权限：用于展示同城内容、地址选择、附近功能或其他与地理位置相关的服务；如您拒绝授权，不影响其他无关基础功能的正常使用。'
				]
			},
			{
				title: '四、信息存储与保护',
				paragraphs: [
					'我们会在实现本政策所述目的所必需的期限内保存您的个人信息，并采取访问控制、加密传输、权限隔离、日志审计等合理安全措施保护您的信息安全。',
					'尽管我们已采取业界通行的安全措施，但互联网环境并非绝对安全。若发生个人信息安全事件，我们将按照法律法规要求及时采取补救措施并履行通知义务。'
				]
			},
			{
				title: '五、信息共享、转让与公开披露',
				paragraphs: [
					'我们不会向无关第三方出售您的个人信息。仅在法律法规允许、实现业务功能所必需或取得您单独同意的情况下，才会与合作方共享必要信息，并要求其按照法律规定履行保护义务。',
					'在支付结算、实名认证、消息推送、内容审核、云存储、风控校验、客服支持等场景中，可能需要接入第三方服务。我们会审慎评估其必要性，并通过协议、规则或技术措施要求其依法合规处理信息。',
					'如发生合并、分立、收购、资产转让等情形导致个人信息转移的，我们将要求承接方继续受本政策约束；若承接方变更原处理目的和方式，我们将依法重新征求您的同意。'
				]
			},
			{
				title: '六、您的权利',
				paragraphs: [
					'您有权依法查询、复制、更正、补充、删除您的个人信息，也有权撤回已授权的权限或关闭相关个性化功能。',
					'您可以通过应用内设置、账号管理、注销入口、客服反馈等方式行使相关权利。若您申请注销账号，我们将在完成身份核验并符合平台规则后处理您的申请。'
				]
			},
			{
				title: '七、未成年人个人信息保护',
				paragraphs: [
					'我们高度重视未成年人个人信息保护。若您为未成年人，请在监护人指导下阅读并决定是否同意本政策。',
					'如我们发现未经监护人同意收集了未成年人的个人信息，将尽快采取删除或匿名化处理措施。'
				]
			},
			{
				title: '八、政策更新与联系我们',
				paragraphs: [
					'我们可能根据业务变化、法律法规更新或监管要求适时修订本隐私政策，并通过页面公示、弹窗提示、站内通知或其他合理方式向您说明。',
					'若您对本政策、个人信息处理规则或相关权利行使有疑问，可通过平台客服、意见反馈或运营方公示联系方式与我们联系。'
				]
			}
		]
	}
}

const { headerHeightPx, windowHeightPx } = useSafeAreaMetrics()

const pageTitle = computed(() => getAgreementPageTitle(documentType.value))
const documentContent = computed(() => AGREEMENT_CONTENT_MAP[documentType.value] || AGREEMENT_CONTENT_MAP.user)
const scrollStyle = computed(() => {
	const topOffsetPx = headerHeightPx(88, 24)
	return {
		paddingTop: `${topOffsetPx}px`,
		height: `${Math.max(windowHeightPx.value - topOffsetPx, 0)}px`
	}
})

onLoad((options) => {
	documentType.value = options?.type === 'privacy' ? 'privacy' : 'user'
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}
</script>

<style scoped>
.agreement-page {
	min-height: 100vh;
	background: #f8fafc;
}

.agreement-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 88rpx;
}

.agreement-back,
.agreement-placeholder {
	width: 64rpx;
	height: 64rpx;
	flex-shrink: 0;
}

.agreement-back {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.06);
}

.agreement-back-text {
	font-size: 30rpx;
	line-height: 30rpx;
	font-weight: 700;
	color: #344054;
}

.agreement-title {
	flex: 1;
	min-width: 0;
	padding: 0 20rpx;
	font-size: 30rpx;
	line-height: 42rpx;
	font-weight: 600;
	color: #101828;
	text-align: center;
}

.agreement-scroll {
	box-sizing: border-box;
}

.agreement-content {
	padding: 40rpx 32rpx 56rpx;
	box-sizing: border-box;
}

.agreement-summary-card,
.agreement-section,
.agreement-footer-card {
	padding: 32rpx 28rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 32rpx rgba(15, 23, 42, 0.05);
}

.agreement-section,
.agreement-footer-card {
	margin-top: 24rpx;
}

.agreement-summary-title,
.agreement-section-title,
.agreement-footer-title {
	display: block;
	font-size: 30rpx;
	line-height: 42rpx;
	font-weight: 600;
	color: #0f172a;
}

.agreement-summary-meta {
	display: block;
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #667085;
}

.agreement-summary-text,
.agreement-section-text,
.agreement-footer-text {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #475467;
}
</style>
