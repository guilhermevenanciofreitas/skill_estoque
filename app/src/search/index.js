import _ from "lodash";
import { Service } from "../service"

export const Search = {

    parceiro: async (search, tipo) => {
        return (await new Service().Post("search/parceiro", {search, tipo}))?.data
    },

    produto: async (search) => {
        return (await new Service().Post("search/produto", {search}))?.data
    },

}