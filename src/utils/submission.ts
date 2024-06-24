import { IRequestStrict } from 'itty-router'
import { Env } from '../types'

export const formSubmissionCheck = async (
	request: IRequestStrict,
	env: Env
) => {
	const url = new URL(request.url)
	let submissionForm = url.searchParams.get('submissionForm')
	if (!submissionForm) {
		return new Response(
			JSON.stringify({ success: false, error: 'No submission form found' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	}
	//get body json of request
	const body = await request.json()
	//check if body is empty
	if (!body) {
		return new Response(
			JSON.stringify({ success: false, error: 'No body found' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	}
	try {
		const stmt = env.DB.prepare(
			'SELECT * FROM SubmissionForms WHERE discord = ?'
		)
		const formResult = await stmt.bind(submissionForm).first

		if (formResult) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Submission form already exists'
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			)
		}
		//insert form into database
		const insertStmt = env.DB.prepare(
			'INSERT INTO SubmissionForms (discord, form) VALUES (?, ?)'
		)
		await insertStmt.bind(submissionForm, JSON.stringify(body))
		await insertStmt.run()

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('Database error:', error)
		return new Response(
			JSON.stringify({ success: false, error: 'Internal Server Error' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
}
