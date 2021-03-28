import {Controller, Get, Header, Post, Body, Param} from "@nestjs/common";
import {VenuesService} from "./venues.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {VERSION_1_URI} from "../utils/versionts";
import {CreateVenueRequest} from "./dto/create-venue-request";
import {VenuesResponse} from "./dto/venues-response";
import FindByIdParams from "../dto/find-by-id-params";
import {SingleVenueResponse} from "./dto/single-venue-response";
import SlackNotificationService, { VENUE_SUBMIT } from "../notifications/slack-notification.service";

const ENV = process.env.ENV || 'dev'

@Controller(`${VERSION_1_URI}/venues`)
@ApiTags('venues')
export class VenuesController {
    constructor(
        private readonly venuesService: VenuesService,
        private readonly slackNotificationService: SlackNotificationService
    ) {
    }

    @Get('/:id')
    @ApiOperation({ summary: 'get a venue by id'})
    @ApiResponse({
        status: 200,
        description: 'single venue',
        type: SingleVenueResponse
    })
    get(@Param() params: FindByIdParams): Promise<SingleVenueResponse> {
        const id = params.id

        return this.venuesService.findById(id)
            .then(venue => new SingleVenueResponse({ venue }))
    }

    @Get()
    @ApiOperation({summary: 'get a list of all the venues'})
    @ApiResponse({
        status: 200,
        description: 'all venues',
        type: VenuesResponse
    })
    getAll(): Promise<VenuesResponse> {
        return this.venuesService.findAll()
            .then(venues => new VenuesResponse({ venues }));
    }

    @Post()
    @Header('content-type', 'application/json')
    @ApiOperation({summary: 'create a new venue'})
    @ApiResponse({
        status: 200,
        description: 'create a venue',
        type: SingleVenueResponse
    })
    create(@Body() venue: CreateVenueRequest): Promise<SingleVenueResponse> {
        return this.venuesService.create(venue)
            .then(venue => {
                const venueData = JSON.stringify((venue as any).dataValues, null, 4)
                this.slackNotificationService.sendNotification(VENUE_SUBMIT, `(${ENV}) New venue created:\n${venueData}`)
                return venue
            })
            .then(venue => new SingleVenueResponse({ venue }));
    }
}