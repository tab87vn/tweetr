'use strict'

const Tweet = use('App/Models/Tweet')
const Reply = use('App/Models/Reply')

class TweetController {
    async tweet({request, auth, reponse}) {
        // get current user
        const user = auth.current.user

        // create new Tweet object
        const newTweet = { user_id: user.id, tweet: request.input('tweet') }

        // save to database
        const tweet = await Tweet.create(newTweet)

        // fetch tweet's relations
        await tweet.loadMany(['user', 'favorites', 'replies'])

        // return
        return response.json({
            status: 'success',
            message: 'Tweet posted',
            data: tweet
        })
    }

    async show({params, reponse}) {
        try {
            let tweetId = params.id
            let tweet = Tweet.query()
                .where('id', tweetId)
                .with('user')
                .with('replies')
                .with('replies.user')
                .with('favorites')
                .firstOrFail()

            return response.json({
                status: 'success',
                data: tweet
            })

        } catch(error) {
            return response.status(404).json({
                status: 'error',
                message: 'Tweet not found'
            })
        }
    }

    async reply({request, auth, response}) {
        let user = auth.current.user
        let tweet = await Tweet.find(params.id)
        let reply = await Reply.create({
            user_id: user.id,
            tweet_id: tweet.id,
            reply: request.input('reply')
        })

        // fetch user that replies
        reply.load('user')

        return response.json({
            status: 'success',
            data: reply,
            message: 'Reply posted'
        })
    }

    async destroy({params, auth, response}) {
        let user = auth.current.user
        let tweetId = params.id
        await Tweet.query()
            .where('id', tweetId)
            .where('user_id', user.id)
            .firstOrFail()
            .delete()

        return response.json({
            status: 'success',
            message: "Tweet deleted successfuly!",
            data: null
        })
    }

}

module.exports = TweetController
