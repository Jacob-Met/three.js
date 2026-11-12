import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import { HalfFloatType, FloatType, UnsignedIntType } from '../../../../../src/constants.js';
import RenderContexts from '../../../../../src/renderers/common/RenderContexts.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'RenderContexts', () => {

			QUnit.test( 'get: reuse shader keys for equivalent target outputs', ( assert ) => {

				const contexts = new RenderContexts( {
					getClearDepth: () => 1,
					getClearStencil: () => 0
				} );

				const single = new RenderTarget( 32, 32, { type: HalfFloatType, samples: 1 } );
				const multisample = new RenderTarget( 32, 32, { type: HalfFloatType, samples: 4 } );
				const float = new RenderTarget( 32, 32, { type: FloatType, samples: 1 } );
				const integer = new RenderTarget( 32, 32, { type: UnsignedIntType, samples: 1 } );
				const noDepth = new RenderTarget( 32, 32, { type: HalfFloatType, depthBuffer: false } );
				const stencil = new RenderTarget( 32, 32, { type: HalfFloatType, stencilBuffer: true } );

				const first = contexts.get( single );
				const second = contexts.get( multisample );
				const third = contexts.get( float );
				const fourth = contexts.get( integer );
				const fifth = contexts.get( noDepth );
				const sixth = contexts.get( stencil );

				assert.notStrictEqual( first, second, 'different sample counts keep their own render contexts' );
				assert.strictEqual( first.stateKey, second.stateKey, 'sample count does not change shader graph' );
				assert.strictEqual( first.stateKey, third.stateKey, 'same output type across formats shares shader graph' );
				assert.notStrictEqual( first.stateKey, fourth.stateKey, 'integer output has a different shader type' );
				assert.notStrictEqual( first.stateKey, fifth.stateKey, 'depth attachment changes shader graph' );
				assert.strictEqual( first.stateKey, sixth.stateKey, 'stencil attachment does not change shader graph' );
				assert.strictEqual( contexts.get( single ), first, 'render contexts are reused for matching attachments' );
				assert.notStrictEqual( contexts.get( single, null, 1 ), first, 'nested renders have separate bindings' );

			} );

		} );

	} );

} );
