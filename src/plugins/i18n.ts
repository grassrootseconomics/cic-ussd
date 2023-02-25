import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const i18nPlugin: FastifyPluginAsync = async (fastify, options) => {

}

export default fp(i18nPlugin, {
  fastify : "4.x",
  name: "i18n"
})