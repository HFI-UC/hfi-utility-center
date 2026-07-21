/// <reference types="vite/client" />
/// <reference types="@types/node" />
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    hideNavbar?: boolean
  }
}

declare module "*.riv" {
  const content: string;
  export default content;
}

declare module "*.riv?inline" {
  const content: string;
  export default content;
}
