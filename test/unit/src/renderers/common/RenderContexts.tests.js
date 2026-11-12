import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../../../../../src/cameras/OrthographicCamera.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import { FloatType, HalfFloatType, RGFormat, UnsignedIntType } from '../../../../../src/constants.js';
import RenderContexts from '../../../../../src/renderers/common/RenderContexts.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'RenderContexts', () => {

			QUnit.test( 'node build state and render attachment state', ( assert ) => {

				const contexts = new RenderContexts( { getClearDepth: () => 1, getClearStencil: () => 0 } );
				const makeTarget = ( options ) => new RenderTarget( 32, 32, { type: HalfFloatType, ...options } );

				const msaa = contexts.get( makeTarget( { samples: 4 } ) );
				const plain = contexts.get( makeTarget( { samples: 0 } ) );

				assert.strictEqual( msaa.stateKey, plain.stateKey, 'sample count does not affect the shader output' );
				assert.notStrictEqual( msaa, plain, 'different samples use distinct render contexts' );
				assert.strictEqual( msaa.sampleCount, 4, 'MSAA is retained by its context' );
				assert.strictEqual( plain.sampleCount, 1, 'single-sample targets keep their sample count' );

				const floatTarget = contexts.get( makeTarget( { type: FloatType } ) );
				assert.strictEqual( plain.stateKey, floatTarget.stateKey, 'float texture storage precision does not affect output type' );
				assert.notStrictEqual( plain, floatTarget, 'storage precision keeps separate attachment contexts' );

				const stencil = contexts.get( makeTarget( { stencilBuffer: true } ) );
				assert.strictEqual( plain.stateKey, stencil.stateKey, 'stencil does not affect shader build' );
				assert.notStrictEqual( plain, stencil, 'stencil affects the attachment context' );

				const rg = contexts.get( makeTarget( { format: RGFormat } ) );
				const integer = contexts.get( makeTarget( { type: UnsignedIntType } ) );
				const noDepth = contexts.get( makeTarget( { depthBuffer: false } ) );

				assert.notStrictEqual( plain.stateKey, rg.stateKey, 'different output vector widths need different shaders' );
				assert.notStrictEqual( plain.stateKey, integer.stateKey, 'integer output types need different shaders' );
				assert.notStrictEqual( plain.stateKey, noDepth.stateKey, 'depth availability affects node material setup' );

				const camera = new PerspectiveCamera();
				const orthographic = new OrthographicCamera();
				const target = makeTarget( {} );
				const perspective = contexts.get( target, null, 0, camera );
				const ortho = contexts.get( target, null, 0, orthographic );
				const mrt = contexts.get( target, { id: 42 }, 0, camera );
				const nested = contexts.get( target, null, 1, camera );

				assert.notStrictEqual( perspective.stateKey, ortho.stateKey, 'camera type affects shader build' );
				assert.notStrictEqual( perspective.stateKey, mrt.stateKey, 'MRT layout affects shader build' );
				assert.strictEqual( perspective.stateKey, nested.stateKey, 'nested renders can reuse the same shader' );
				assert.notStrictEqual( perspective, nested, 'nested renders retain separate bindings' );

			} );

		} );

	} );

} );
