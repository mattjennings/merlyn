import { Transition, type TransitionArgs } from 'merlyn/transitions'

export class BattleTransition extends Transition {
  fade!: ex.Actor
  pixel = new PixelationPostProcessor()
  swirl = new SwirlPostProcessor()

  constructor(args: TransitionArgs = {}) {
    super({
      duration: 2000,
      easing: (t: number) => {
        // easeInOutCubic
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      },
      ...args,
    })
  }

  onInitialize(engine: ex.Engine): void {
    engine.graphicsContext.addPostProcessor(this.pixel)
    engine.graphicsContext.addPostProcessor(this.swirl)

    const pixelShader = this.pixel.getShader()
    const swirlShader = this.swirl.getShader()

    pixelShader.use()
    pixelShader.setUniformFloatVector(
      'u_resolution',
      ex.vec(this.scene.engine.drawWidth, this.scene.engine.drawHeight)
    )
    swirlShader.use()

    swirlShader.setUniformFloatVector(
      'u_resolution',
      ex.vec(this.scene.engine.drawWidth, this.scene.engine.drawHeight)
    )

    this.fade = new ex.ScreenElement({
      x: -1,
      y: -1,
      z: 9999,
      width: engine.currentScene.camera.viewport.width + 2,
      height: engine.currentScene.camera.viewport.height + 2,
      color: ex.Color.White,
    })

    this.fade.graphics.opacity = 0

    this.addChild(this.fade)
  }

  processFade(progress: number, out: boolean) {
    const pixelShader = this.pixel.getShader()
    const swirlShader = this.swirl.getShader()

    if (out && progress < 1) {
      pixelShader.use()
      pixelShader.setUniformFloat(
        'u_time',
        (out ? progress : 1 - progress) * 1.5
      )
    }

    if (progress > 0.25) {
      swirlShader.use()
      if (out && progress < 1) {
        const adjusted = progress * 1.25 - 0.25

        swirlShader.setUniformFloat(
          'u_time',
          (out ? adjusted : 1 - adjusted) * 2
        )
      } else {
        swirlShader.setUniformFloat('u_time', 0)
      }
    }

    if (out) {
      this.fade.graphics.opacity = progress
    } else {
      this.fade.graphics.opacity = 1 - progress
    }
  }

  onOutro(progress: number) {
    const pixelShader = this.pixel.getShader()
    const swirlShader = this.swirl.getShader()

    pixelShader.use()
    pixelShader.setUniformFloat('u_time', progress * 1.5)

    if (progress > 0.25) {
      swirlShader.use()
      const adjusted = progress * 1.25 - 0.25

      swirlShader.setUniformFloat('u_time', adjusted * 2)
      swirlShader.setUniform
    }

    this.fade.graphics.opacity = progress
  }

  onOutroComplete() {
    this.scene.engine.graphicsContext.removePostProcessor(this.pixel)
    this.scene.engine.graphicsContext.removePostProcessor(this.swirl)
  }

  onIntro(progress: number) {
    this.fade.graphics.opacity = 1 - progress
  }

  onPreKill() {
    this.scene.engine.graphicsContext.removePostProcessor(this.pixel)
    this.scene.engine.graphicsContext.removePostProcessor(this.swirl)
  }
}

class PixelationPostProcessor implements ex.PostProcessor {
  private _shader!: ex.ScreenShader

  initialize(gl: WebGLRenderingContext): void {
    this._shader = new ex.ScreenShader(/* glsl */ `#version 300 es
    precision mediump float;

    // Common uniforms
    uniform vec2 u_resolution;
    uniform float u_time;

    // Texture uniforms
    uniform sampler2D u_texture;

    // Texture varyings
    in vec2 v_texcoord;
    out vec4 fragColor;

    void main() {
      // Calculate the square size in pixel units based on the mouse position
      float square_size = 1.0 + 15.0 * (u_time);

      // Calculate the square center and corners
      vec2 center = square_size * floor(v_texcoord * u_resolution / square_size) + square_size * vec2(0.5, 0.5);
      vec2 corner1 = center + square_size * vec2(-0.5, -0.5);
      vec2 corner2 = center + square_size * vec2(+0.5, -0.5);
      vec2 corner3 = center + square_size * vec2(+0.5, +0.5);
      vec2 corner4 = center + square_size * vec2(-0.5, +0.5);

      // Calculate the average pixel color
      vec3 pixel_color = 0.4 * texture(u_texture, center / u_resolution).rgb;
      pixel_color += 0.15 * texture(u_texture, corner1 / u_resolution).rgb;
      pixel_color += 0.15 * texture(u_texture, corner2 / u_resolution).rgb;
      pixel_color += 0.15 * texture(u_texture, corner3 / u_resolution).rgb;
      pixel_color += 0.15 * texture(u_texture, corner4 / u_resolution).rgb;

      // Fragment shader output
      fragColor = vec4(pixel_color, 1.0);
    }
    `)
  }

  getLayout(): ex.VertexLayout {
    return this._shader.getLayout()
  }

  getShader(): ex.Shader {
    return this._shader.getShader()
  }
}

class SwirlPostProcessor implements ex.PostProcessor {
  private _shader!: ex.ScreenShader

  initialize(gl: WebGLRenderingContext): void {
    this._shader = new ex.ScreenShader(/* glsl */ `#version 300 es
    precision mediump float;

    // Common uniforms
    uniform vec2 u_resolution;
    uniform float u_time;

    // Texture uniforms
    uniform sampler2D u_texture;

    // Texture varyings
    in vec2 v_texcoord;
    out vec4 fragColor;

    vec4 PostFX(sampler2D tex, vec2 uv, float time) {
      // Swirl effect parameters
      float radius = 200.0;
      float angle = time * 0.25;
      vec2 center = vec2(u_resolution.x / 2.0, u_resolution.y / 2.0);

      vec2 texSize = vec2(u_resolution.x, u_resolution.y);
      vec2 tc = uv * texSize;
      tc -= center;
      float dist = length(tc);
      if (dist < radius) 
      {
        float percent = (radius - dist) / radius;
        float theta = percent * percent * angle * 8.0;
        float s = sin(theta);
        float c = cos(theta);
        tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
      }
      tc += center;
      vec3 color = texture(u_texture, tc / texSize).rgb;
      return vec4(color, 1.0);
    }

    void main() {
      fragColor = PostFX(u_texture, v_texcoord, u_time);
    }
    `)
  }

  getLayout(): ex.VertexLayout {
    return this._shader.getLayout()
  }

  getShader(): ex.Shader {
    return this._shader.getShader()
  }
}
