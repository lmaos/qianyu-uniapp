/**
 * useStorageApi — 文件存储 API
 *
 * 职责：
 *   1. POST /api/storage/upload  → 上传文件，返回 CDN URL
 *   2. POST /api/storage/delete  → 删除已上传文件
 *   3. GET  /api/storage/presign → 获取预签名链接
 *
 * ── 使用 ──
 * import { uploadFile } from '@/composables/useStorageApi.js'
 * const { url, id, key } = await uploadFile(tempFilePath, 'moment/image')
 */

import request from '@/composables/baseRequest.js'

/**
 * 上传单个文件
 * @param {string} filePath    - 本地文件路径（uni.chooseImage / uni.chooseMedia 返回的 tempFilePath）
 * @param {string} pathPrefix  - 存储路径前缀，如 'moment/image'、'moment/video'
 * @returns {Promise<{id: number, url: string, key: string, fileType: string}>}
 */
export async function uploadFile(filePath, pathPrefix = 'upload') {
	const res = await request.fileUpload({
		url: '/api/storage/upload',
		filePath,
		name: 'file',
		formData: { path: pathPrefix }
	})

	if (res.code !== 200) {
		throw new Error('上传失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '上传失败')
	}

	return body.content
}
