import gsap from 'gsap'
import Tempus from 'tempus'
import * as THREE from 'three'
import { RawShaderMaterial } from './module/ExtendedMaterials'
import { UnworkableCamera } from './module/UnworkableCamera'
import fragmentShader from './shader/screen.fs'
import vertexShader from './shader/screen.vs'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

const { innerWidth: width, innerHeight: height } = window

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(width, height)
// renderer.setPixelRatio(window.devicePixelRatio)
renderer.setPixelRatio(2)

const scene = new THREE.Scene()
const camera = new UnworkableCamera()

const loader = new THREE.TextureLoader()
const texture = await loader.loadAsync(import.meta.env.BASE_URL + 'msdf.png')
texture.colorSpace = THREE.NoColorSpace

const dpr = renderer.getPixelRatio()

const geo = new THREE.PlaneGeometry(2, 2)
const mat = new RawShaderMaterial({
	uniforms: {
		msdf: { value: texture },
		resolution: { value: [width * dpr, height * dpr] },
		progress: { value: 0 },
		randomSeed: { value: Math.random() },
	},
	vertexShader,
	fragmentShader,
})
scene.add(new THREE.Mesh(geo, mat))

window.addEventListener('resize', () => {
	const { innerWidth: width, innerHeight: height } = window
	const dpr = renderer.getPixelRatio()

	renderer.setSize(width, height)
	mat.uniforms.resolution.value = [width * dpr, height * dpr]
})

function render() {
	renderer.setRenderTarget(null)
	renderer.render(scene, camera)
}

// ===========================
// render settings
// ===========================
// Remove GSAP's internal RAF
gsap.ticker.remove(gsap.updateRoot)
// Add to Tempus
Tempus.add((time) => gsap.updateRoot(time / 1000))

Tempus.add(render, { priority: -1 })

gsap.fromTo(
	mat.uniforms.progress,
	{ value: 0 },
	{
		value: 1,
		duration: 3,
		ease: 'none',
		repeat: -1,
		repeatDelay: 1,
		onRepeat: () => {
			mat.uniforms.randomSeed.value = Math.random()
		},
	},
)
