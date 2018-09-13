'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
    async signup ({request, auth, response}) {
        const userData = request.only(['name', 'username', 'email', 'password'])
        try {
            const user = await User.create(userData)
            const token = await auth.generate(user)

            return response.json({
                status: 'Success',
                data: token
            })
        } catch (error) {
            return response.status(400).json({
                status: 'Error',
                message: 'There was a problem creating a new user. Please try again!'
            })
        }
    }

    async login ({request, auth, response}) {
        const userData = request.only(['name', 'username', 'email', 'password'])
        try {
            const token = await auth.attempt(
                request.input('email'), 
                request.input('password')
            )

            return response.json({
                status: 'Success',
                data: token
            })
        } catch (error) {
            return response.status(400).json({
                status: 'Error',
                message: 'Invalid username or password!'
            })
        }
    }

    async me ({auth, response}) {
        const user = await this._getUser('id',auth.current.user.id)

        return response.json({
            status: 'success',
            data: user
        })
    }

    async updateProfile ({request, auth, response}) {
        try {
            const user = auth.current.user

            user.name = request.input('name')
            user.username = request.input('username')
            user.email = request.input('email')
            user.location = request.input('location')
            user.bio = request.input('bio')
            user.website_url = request.input('website_url')

            await user.save()

            return response.json({
                status: 'success',
                message: 'Profile updated!',
                data: user
            })
        } catch (error) {
            console.log(error)
            return response.status(400).json({
                status: 'error',
                message: 'There was a problem updating profile, please try again later.'
            })
        }
    }

    async changePassword ({request, auth, response}) {
        const user = auth.current.user
        
        const verifyPassword = Hash.verify(request.input('password'), user.password)
        if (!verifyPassword) {
            return response.status(400).json({
                status: 'error',
                message: 'Current password could not be verified! Please try again.'
            })
        }

        user.password = await Hash.make(request.input('newPassword'))
        await user.save()

        return response.json({
            status: 'success',
            message: 'Password updated!'
        })
    
    }

    async showProfile ({request, params, response}) {
        try {
            const user = await this._getUser('username', params.username)
            return response.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            return response.status(404).json({
                status: 'error',
                message: 'User not found'
            })
        }
    }


    // PRIVATE METHODS
    async _getUser (key, value) {
        return await User.query()
            .where(key, value)
            .with('tweets', builder => {
                builder.with('user')
                builder.with('favorites')
                builder.with('replies')
            })
            .with('following')
            .with('followers')
            .with('favorites')
            .with('favorites.tweet', builder => {
                builder.with('user')
                builder.with('favorites')
                builder.with('replies')
            })
            .firstOrFail()        
    }

    async usersToFollow ({ params, auth, response }) {
        // get currently authenticated user
        const user = auth.current.user
    
        // get the IDs of users the currently authenticated user is already following
        const usersAlreadyFollowing = await user.following().ids()
    
        // fetch users the currently authenticated user is not already following
        const usersToFollow = await User.query()
            .whereNot('id', user.id)
            .whereNotIn('id', usersAlreadyFollowing)
            .pick(3)
    
        return response.json({
            status: 'success',
            data: usersToFollow
        })
    }

    // async follow ({ request, auth, response }) {
    async follow ({ params, auth, response }) {
        // get currently authenticated user
        const user = auth.current.user
    
        // add to user's followers
        // NOTE: WHY NOT PARAMS.ID
        // await user.following().attach(request.input('user_id'))
        await user.following().attach(params.id)
    
        return response.json({
            status: 'success',
            data: null
        })
    }

    async unFollow ({ params, auth, response }) {
        // get currently authenticated user
        const user = auth.current.user
    
        // remove from user's followers
        await user.following().detach(params.id)
    
        return response.json({
            status: 'success',
            data: null
        })
    }

}

module.exports = UserController
