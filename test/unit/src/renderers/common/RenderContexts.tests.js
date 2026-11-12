import { OrthographicCamera } from '../../../../../src/cameras/OrthographicCamera.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { HalfFloatType, RedFormat } from '../../../../../src/constants.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import RenderContexts from '../../../../../src/renderers/common/RenderContexts.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'RenderContexts', () => {

			QUnit.test( 'shader state ignores pipeline-only attachment differences', ( assert ) => {

				const renderer = { getClearDepth: () => 1, getClearStencil: () => 0 };
				const contexts = new RenderContexts( renderer );

				const msaa = new RenderTarget( 16, 16, { samples: 4, type: HalfFloatType } );
				const plain = new RenderTarget( 16, 16, { samples: 1, type: HalfFloatType } );
				const stencil = new RenderTarget( 16, 16, { samples: 1, type: HalfFloatType, stencilBuffer: true } );

				const msaaContext = contexts.get( msaa );
				const plainContext = contexts.get( plain );
				const stencilContext = contexts.get( stencil );

				assert.strictEqual( msaaContext.stateKey, plainContext.stateKey, 'MSAA sample count does not change the node graph' );
				assert.strictEqual( plainContext.stateKey, stencilContext.stateKey, 'stencil state does not change the node graph' );
				assert.notStrictEqual( msaaContext, plainContext, 'sample count has an independent render context' );
				assert.notStrictEqual( plainContext, stencilContext, 'stencil state has an independent render context' );
				assert.strictEqual( msaaContext.sampleCount, 4, 'MSAA pipeline retains four samples' );
				assert.strictEqual( plainContext.sampleCount, 1, 'single-sample pipeline retains one sample' );
				assert.notStrictEqual( contexts.get( plain, null, 1 ), plainContext, 'nested rendering retains a separate render context' );
				assert.strictEqual( contexts.get( plain, null, 1 ).stateKey, plainContext.stateKey, 'nested rendering can reuse its node graph' );

			} );

			QUnit.test( 'shader state separates relevant output and camera differences', ( assert ) => {

				const renderer = { getClearDepth: () => 1, getClearStencil: () => 0 };
				const contexts = new RenderContexts( renderer );

				const color = new RenderTarget( 16, 16, { type: HalfFloatType } );
				const red = new RenderTarget( 16, 16, { format: RedFormat } );
				const withoutDepth = new RenderTarget( 16, 16, { type: HalfFloatType, depthBuffer: false } );
				const perspective = new PerspectiveCamera();
				const orthographic = new OrthographicCamera();

				const reference = contexts.get( color, null, 0, perspective );
				assert.notStrictEqual( reference.stateKey, contexts.get( red, null, 0, perspective ).stateKey, 'different output types require different nodes' );
				assert.notStrictEqual( reference.stateKey, contexts.get( withoutDepth, null, 0, perspective ).stateKey, 'depth support affects the node graph' );
				assert.notStrictEqual( reference.stateKey, contexts.get( color, null, 0, orthographic ).stateKey, 'camera projection affects the node graph' );
				assert.notStrictEqual( reference.stateKey, contexts.get( color, { id: 123 }, 0, perspective ).stateKey, 'MRT output layout affects the node graph' );

			} );

		} );

	} );

} );
