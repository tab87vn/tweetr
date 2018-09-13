'use strict'

const Model = use('Model')

class Favorite extends Model {
    tweet () {
        return this.belongsTo('App/Model/Tweet')
    }

    user () {
        return this.belongsTo('App/Model/User')
    }
}

module.exports = Favorite
