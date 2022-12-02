export default function polyfill(ctx) {
  const { gl, capabilities } = ctx;

  if (!gl.HALF_FLOAT) {
    const ext = gl.getExtension("OES_texture_half_float");
    if (ext) gl.HALF_FLOAT = ext.HALF_FLOAT_OES;
  }

  if (!gl.createVertexArray) {
    const ext = gl.getExtension("OES_vertex_array_object");
    gl.createVertexArray = ext.createVertexArrayOES.bind(ext);
    gl.bindVertexArray = ext.bindVertexArrayOES.bind(ext);
  }

  if (!gl.drawElementsInstanced) {
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    gl.drawElementsInstanced = ext.drawElementsInstancedANGLE.bind(ext);
    gl.drawArraysInstanced = ext.drawArraysInstancedANGLE.bind(ext);
    gl.vertexAttribDivisor = ext.vertexAttribDivisorANGLE.bind(ext);
  }

  if (!gl.drawBuffers) {
    const ext = gl.getExtension("WEBGL_draw_buffers");
    if (!ext) {
      gl.drawBuffers = () => {
        throw new Error("WEBGL_draw_buffers not supported");
      };
    } else {
      gl.drawBuffers = ext.drawBuffersWEBGL.bind(ext);
      capabilities.maxColorAttachments = gl.getParameter(
        ext.MAX_COLOR_ATTACHMENTS_WEBGL
      );
    }
  } else {
    capabilities.maxColorAttachments = gl.getParameter(
      gl.MAX_COLOR_ATTACHMENTS
    );
  }

  if (!capabilities.disjointTimerQuery) {
    gl.TIME_ELAPSED ||= "TIME_ELAPSED";
    gl.GPU_DISJOINT ||= "GPU_DISJOINT";
    gl.QUERY_RESULT ||= "QUERY_RESULT";
    gl.QUERY_RESULT_AVAILABLE ||= "QUERY_RESULT_AVAILABLE";
    gl.createQuery ||= () => ({});
    gl.deleteQuery ||= () => {};
    gl.beginQuery ||= () => {};
    gl.endQuery ||= () => {};
    gl.getQueryParameter = (q, param) => {
      if (param === gl.QUERY_RESULT_AVAILABLE) return true;
      if (param === gl.QUERY_RESULT) return 0;
      return undefined;
    };
    gl.getQueryObject = gl.getQueryParameter;
  } else {
    const extDTQ = capabilities.isWebGL2
      ? gl.getExtension("EXT_disjoint_timer_query_webgl2")
      : gl.getExtension("EXT_disjoint_timer_query");
    gl.TIME_ELAPSED = extDTQ.TIME_ELAPSED_EXT;
    gl.GPU_DISJOINT = extDTQ.GPU_DISJOINT_EXT;
    gl.QUERY_RESULT ||= extDTQ.QUERY_RESULT_EXT;
    gl.QUERY_RESULT_AVAILABLE ||= extDTQ.QUERY_RESULT_AVAILABLE_EXT;
    gl.createQuery ||= extDTQ.createQueryEXT.bind(extDTQ);
    gl.deleteQuery ||= extDTQ.deleteQueryEXT.bind(extDTQ);
    gl.beginQuery ||= extDTQ.beginQueryEXT.bind(extDTQ);
    gl.endQuery ||= extDTQ.endQueryEXT.bind(extDTQ);
    gl.getQueryParameter ||= extDTQ.getQueryObjectEXT.bind(extDTQ);
  }

  if (!capabilities.isWebGL2) {
    gl.getExtension("OES_element_index_uint");
    gl.getExtension("OES_standard_derivatives");
  }

  if (!gl.RGB16F) {
    const ext = gl.getExtension("EXT_color_buffer_half_float");
    if (ext) {
      gl.RGB16F = ext.RGB16F_EXT;
      gl.RGBA16F ||= ext.RGBA16F_EXT;
    }
  }

  if (!gl.RGB32F) {
    const ext = gl.getExtension("WEBGL_color_buffer_float");
    if (ext) {
      gl.RGB32F = ext.RGB32F_EXT;
      gl.RGBA32F ||= ext.RGBA32F_EXT;
    }
  }
}
