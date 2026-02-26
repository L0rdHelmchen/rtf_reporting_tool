/**
 * RTF Reporting Tool - Reporting Periods Routes
 *
 * Provides available RTF reporting periods (annual, December 31)
 */

import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

export default async function reportingPeriodsRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  /**
   * Get available reporting periods
   * RTF reporting is annual, with cutoff date December 31
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const currentYear = new Date().getFullYear();

    // Generate the last 4 completed years + current year
    const periods = [];
    for (let year = currentYear - 4; year <= currentYear; year++) {
      const isCurrentYear = year === currentYear;
      const isPreviousYear = year === currentYear - 1;
      periods.push({
        id: `${year}-12-31`,
        label: `${year} (31.12.${year})`,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        isActive: isPreviousYear // Most recent completed year is the "active" default
      });
    }

    // Return array directly (frontend expects response.data to be the array)
    return reply.send(periods);
  });
}
