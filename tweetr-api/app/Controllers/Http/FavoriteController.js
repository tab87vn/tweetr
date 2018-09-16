'use strict'

const Favorite = use('App/Models/Favorite')

class FavoriteController {
    async favorite({request, auth, response}) {
        let user = auth.current.user
        let tweetId = request.input('tweet_id')

        let fav = Favorite.findOrCreate(
            { user_id: user.id, tweet_id: tweetId },
            { user_id: user.id, tweet_id: tweetId }
        )

        return response.json({
            status: 'success',
            data: fav
        })
    }

    async unFavorite({params, auth, response}) {
        let user = auth.current.user
        let tweetId = params.id

        Favorite.query()
            .where('user_id', user.id)
            .where('tweet_id', tweetId)
            .delete()

        return response.json({
            state: 'sucess',
            data: null
        })
    }
}

module.exports = FavoriteController
